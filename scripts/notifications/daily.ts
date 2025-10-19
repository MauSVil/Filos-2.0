/**
 * Script de Notificaciones Diarias
 *
 * Este script se ejecuta diariamente desde Coolify Scheduled Tasks
 * para enviar notificaciones push con el resumen de urgencias.
 *
 * Uso:
 *   npx tsx scripts/notifications/daily.ts
 *
 * Coolify Scheduled Task:
 *   0 8 * * * cd /app && npx tsx scripts/notifications/daily.ts
 */

import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { connectToDatabase, closeDatabase } from "./db";
import { sendPushNotifications } from "./send-push";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";
import { ProductBaseWithIdType } from "@/types/v2/Product/Base.type";

interface UrgencyItem {
  type: string;
  priority: "high" | "medium" | "low";
  message: string;
  count: number;
  amount?: number;
}

async function getWeeklyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start of week (Monday)
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // End of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [allOrders, criticalStockProducts] = await Promise.all([
    OrderRepository.find({ status: { $ne: "Cancelado" } }),
    ProductRepository.findWithOptions(
      {
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
        quantity: { $lte: 5 }
      },
      { limit: 20, sort: { quantity: 1 } }
    )
  ]);

  // Orders to deliver this week
  const ordersThisWeek = allOrders.filter((order: OrderBaseWithIdType) => {
    const dueDate = new Date(order.dueDate);
    return dueDate >= startOfWeek && dueDate <= endOfWeek && order.status === "Pendiente";
  });

  // Overdue orders
  const overdueOrders = allOrders
    .filter((order: OrderBaseWithIdType) => {
      const dueDate = new Date(order.dueDate);
      return dueDate < today && order.status === "Pendiente";
    })
    .map((order: OrderBaseWithIdType) => {
      const dueDate = new Date(order.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return { ...order, daysOverdue };
    });

  // Pending payments
  const pendingPayments = allOrders
    .filter((order: OrderBaseWithIdType) => !order.paid && order.status !== "Cancelado")
    .map((order: OrderBaseWithIdType) => {
      const dueDate = new Date(order.dueDate);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...order, daysUntilDue };
    });

  const overduePayments = pendingPayments.filter(order => order.daysUntilDue < 0);
  const totalOverdueAmount = overduePayments.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const outOfStock = criticalStockProducts.filter((p: ProductBaseWithIdType) => p.quantity === 0);

  // Deliveries today or tomorrow
  const deliveriesSoon = ordersThisWeek.filter((order: OrderBaseWithIdType) => {
    const dueDate = new Date(order.dueDate);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dueDate.toDateString() === today.toDateString() || dueDate.toDateString() === tomorrow.toDateString();
  });

  return {
    overdueOrders: overdueOrders.length,
    overduePayments: overduePayments.length,
    totalOverdueAmount,
    outOfStock: outOfStock.length,
    criticalStock: criticalStockProducts.length,
    deliveriesSoon: deliveriesSoon.length,
    deliveriesThisWeek: ordersThisWeek.length
  };
}

function analyzeUrgencies(stats: Awaited<ReturnType<typeof getWeeklyStats>>): UrgencyItem[] {
  const urgencies: UrgencyItem[] = [];

  // High priority - Overdue orders
  if (stats.overdueOrders > 0) {
    urgencies.push({
      type: "overdue_orders",
      priority: "high",
      message: `${stats.overdueOrders} entrega${stats.overdueOrders > 1 ? 's' : ''} atrasada${stats.overdueOrders > 1 ? 's' : ''}`,
      count: stats.overdueOrders
    });
  }

  // High priority - Overdue payments
  if (stats.overduePayments > 0) {
    urgencies.push({
      type: "overdue_payments",
      priority: "high",
      message: `${stats.overduePayments} pago${stats.overduePayments > 1 ? 's' : ''} vencido${stats.overduePayments > 1 ? 's' : ''} ($${stats.totalOverdueAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })})`,
      count: stats.overduePayments,
      amount: stats.totalOverdueAmount
    });
  }

  // Medium priority - Deliveries today or tomorrow
  if (stats.deliveriesSoon > 0) {
    urgencies.push({
      type: "deliveries_soon",
      priority: "medium",
      message: `${stats.deliveriesSoon} entrega${stats.deliveriesSoon > 1 ? 's' : ''} próxima${stats.deliveriesSoon > 1 ? 's' : ''}`,
      count: stats.deliveriesSoon
    });
  }

  // Medium priority - Out of stock
  if (stats.outOfStock > 0) {
    urgencies.push({
      type: "out_of_stock",
      priority: "medium",
      message: `${stats.outOfStock} producto${stats.outOfStock > 1 ? 's' : ''} sin stock`,
      count: stats.outOfStock
    });
  }

  // Low priority - Critical stock
  if (stats.criticalStock > 5) {
    urgencies.push({
      type: "critical_stock",
      priority: "low",
      message: `${stats.criticalStock} productos con stock bajo`,
      count: stats.criticalStock
    });
  }

  return urgencies;
}

async function sendPushNotification(urgencies: UrgencyItem[]) {
  const db = await connectToDatabase();

  // Obtener usuarios admin con pushToken
  const adminUsers = await db
    .collection("users")
    .find({
      role: "admin",
      pushToken: { $exists: true, $ne: null }
    })
    .toArray();

  if (adminUsers.length === 0) {
    console.log("⚠️  No hay usuarios admin con pushToken configurado");
    return;
  }

  const highPriority = urgencies.filter(u => u.priority === "high");
  const mediumPriority = urgencies.filter(u => u.priority === "medium");

  let title = "☀️ Buenos días!";
  let body = "";

  if (highPriority.length > 0) {
    title = "⚠️ Acciones urgentes";
    body = highPriority.map(u => `• ${u.message}`).join("\n");
  } else if (mediumPriority.length > 0) {
    title = "📋 Tareas del día";
    body = mediumPriority.map(u => `• ${u.message}`).join("\n");
  } else {
    body = "Todo está bajo control hoy 🎉";
  }

  console.log(`📱 Enviando notificación a ${adminUsers.length} admin(s):`);
  adminUsers.forEach((user: any) => {
    console.log(`   • ${user.name} (${user.email})`);
  });
  console.log(`\n   Título: ${title}`);
  console.log(`   Mensaje:\n${body.split('\n').map(line => `   ${line}`).join('\n')}`);

  // Enviar usando el helper
  const notifications = adminUsers.map((user: any) => ({
    token: user.pushToken,
    title,
    body,
    data: {
      urgencies,
      userId: user._id.toString(),
      userName: user.name
    }
  }));

  const result = await sendPushNotifications(notifications);

  console.log(`\n   ✅ Enviadas: ${result.sent}`);
  if (result.errors.length > 0) {
    console.log(`   ❌ Errores: ${result.errors.length}`);
  }

  // Log para auditoría
  await db.collection("notificationLogs").insertOne({
    timestamp: new Date(),
    title,
    body,
    urgencies,
    recipients: adminUsers.map((u: any) => ({
      userId: u._id.toString(),
      name: u.name,
      email: u.email
    })),
    recipientCount: adminUsers.length,
    sent: result.sent,
    errors: result.errors,
    success: result.errors.length === 0
  });
}

async function main() {
  console.log("🔔 Iniciando script de notificaciones diarias...");
  console.log(`📅 Fecha: ${new Date().toLocaleString("es-MX")}`);

  try {
    // Conectar a la base de datos
    await connectToDatabase();
    console.log("✅ Conectado a MongoDB");

    // Obtener estadísticas semanales
    console.log("📊 Obteniendo estadísticas...");
    const stats = await getWeeklyStats();

    console.log("\n📈 Resumen:");
    console.log(`   • Entregas atrasadas: ${stats.overdueOrders}`);
    console.log(`   • Pagos vencidos: ${stats.overduePayments} ($${stats.totalOverdueAmount.toFixed(2)})`);
    console.log(`   • Entregas próximas: ${stats.deliveriesSoon}`);
    console.log(`   • Entregas esta semana: ${stats.deliveriesThisWeek}`);
    console.log(`   • Productos sin stock: ${stats.outOfStock}`);
    console.log(`   • Stock crítico: ${stats.criticalStock}`);

    // Analizar urgencias
    const urgencies = analyzeUrgencies(stats);
    console.log(`\n🔍 Urgencias detectadas: ${urgencies.length}`);
    urgencies.forEach(u => {
      const emoji = u.priority === "high" ? "🔴" : u.priority === "medium" ? "🟡" : "🟢";
      console.log(`   ${emoji} [${u.priority.toUpperCase()}] ${u.message}`);
    });

    // Enviar notificación push
    if (urgencies.length > 0 || process.env.ALWAYS_NOTIFY === "true") {
      await sendPushNotification(urgencies);
      console.log("\n✅ Notificación enviada exitosamente");
    } else {
      console.log("\nℹ️  No hay urgencias, no se envió notificación");
      console.log("   (Configura ALWAYS_NOTIFY=true para enviar siempre)");
    }

    console.log("\n✨ Script completado exitosamente");

    // Cerrar conexión a MongoDB
    await closeDatabase();
    console.log("🔌 Conexión a MongoDB cerrada");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error en el script:", error);

    // Cerrar conexión a MongoDB incluso si hay error
    await closeDatabase();

    process.exit(1);
  }
}

// Ejecutar script
main();
