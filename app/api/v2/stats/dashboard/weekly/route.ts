import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { NextResponse } from "next/server";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";
import { ProductBaseWithIdType } from "@/types/v2/Product/Base.type";
import {
  getTodayStartInMexicoCity,
  getStartOfWeekInMexicoCity,
  getEndOfWeekInMexicoCity,
  getDaysDifference,
  getNowInMexicoCity
} from "@/utils/timezone";

export const GET = async () => {
  try {
    const today = getTodayStartInMexicoCity();
    const startOfWeek = getStartOfWeekInMexicoCity();
    const endOfWeek = getEndOfWeekInMexicoCity();

    const [allOrders, criticalStockProducts] = await Promise.all([
      OrderRepository.find({
        status: { $ne: "Cancelado" }
      }),
      ProductRepository.findWithOptions(
        {
          $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
          quantity: { $lte: 5 }
        },
        {
          limit: 20,
          sort: { quantity: 1 }
        }
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
        const daysOverdue = getDaysDifference(today, order.dueDate);
        return { ...order, daysOverdue };
      });

    // Pending payments
    const pendingPayments = allOrders
      .filter((order: OrderBaseWithIdType) => !order.paid && order.status !== "Cancelado")
      .map((order: OrderBaseWithIdType) => {
        const daysUntilDue = getDaysDifference(order.dueDate, today);
        return { ...order, daysUntilDue };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    const overduePayments = pendingPayments.filter(order => order.daysUntilDue < 0);
    const totalPendingAmount = pendingPayments.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOverdueAmount = overduePayments.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Generate urgent actions
    const urgentActions = [];

    if (overdueOrders.length > 0) {
      urgentActions.push({
        type: "overdue_orders",
        priority: "high",
        title: `${overdueOrders.length} entrega(s) atrasada(s)`,
        description: `${overdueOrders[0].name} - Atrasada ${overdueOrders[0].daysOverdue} día(s)`,
        count: overdueOrders.length,
        actionLabel: "Ver detalles",
        actionUrl: "/orders",
        orders: overdueOrders.slice(0, 10).map((order: any) => ({
          id: order._id,
          name: order.name,
          dueDate: order.dueDate,
          totalAmount: order.totalAmount,
          daysOverdue: order.daysOverdue
        }))
      });
    }

    if (ordersThisWeek.length > 0) {
      urgentActions.push({
        type: "deliveries_this_week",
        priority: "medium",
        title: `${ordersThisWeek.length} entrega(s) esta semana`,
        description:
          ordersThisWeek.length === 1 ? ordersThisWeek[0].name : `${ordersThisWeek.length} órdenes por entregar`,
        count: ordersThisWeek.length,
        actionLabel: "Ver calendario",
        actionUrl: "/orders",
        orders: ordersThisWeek.slice(0, 10).map((order: OrderBaseWithIdType) => ({
          id: order._id,
          name: order.name,
          dueDate: order.dueDate,
          totalAmount: order.totalAmount
        }))
      });
    }

    if (overduePayments.length > 0) {
      urgentActions.push({
        type: "overdue_payments",
        priority: "high",
        title: `${overduePayments.length} pago(s) vencido(s)`,
        description: `$${totalOverdueAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} por cobrar`,
        count: overduePayments.length,
        amount: totalOverdueAmount,
        actionLabel: "Ver pagos",
        actionUrl: "/orders",
        orders: overduePayments.slice(0, 10).map((order: any) => ({
          id: order._id,
          name: order.name,
          dueDate: order.dueDate,
          totalAmount: order.totalAmount,
          daysUntilDue: order.daysUntilDue
        }))
      });
    }

    const outOfStock = criticalStockProducts.filter((p: ProductBaseWithIdType) => p.quantity === 0);
    if (outOfStock.length > 0) {
      urgentActions.push({
        type: "out_of_stock",
        priority: "medium",
        title: `${outOfStock.length} producto(s) sin stock`,
        description: outOfStock.length === 1 ? outOfStock[0].name : "Revisar inventario",
        count: outOfStock.length,
        actionLabel: "Ver productos",
        actionUrl: "/products",
        products: outOfStock.slice(0, 10).map((product: ProductBaseWithIdType) => ({
          id: product._id,
          uniqId: product.uniqId,
          name: product.name,
          color: product.color,
          size: product.size,
          quantity: product.quantity
        }))
      });
    }

    const lowStock = criticalStockProducts.filter((p: ProductBaseWithIdType) => p.quantity > 0 && p.quantity <= 5);
    if (lowStock.length > 0) {
      urgentActions.push({
        type: "low_stock",
        priority: "low",
        title: `${lowStock.length} producto(s) con stock bajo`,
        description: `Menos de 5 unidades disponibles`,
        count: lowStock.length,
        actionLabel: "Ver inventario",
        actionUrl: "/products",
        products: lowStock.slice(0, 10).map((product: ProductBaseWithIdType) => ({
          id: product._id,
          uniqId: product.uniqId,
          name: product.name,
          color: product.color,
          size: product.size,
          quantity: product.quantity
        }))
      });
    }

    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const topActions = urgentActions
      .sort(
        (a, b) =>
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
      )
      .slice(0, 5);

    // Calendar data
    const calendarData: Record<string, OrderBaseWithIdType[]> = {};
    ordersThisWeek.forEach((order: OrderBaseWithIdType) => {
      const dateKey = new Date(order.dueDate).toISOString().split("T")[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(order);
    });

    const response = {
      weekInfo: {
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
        currentDay: today.toISOString()
      },
      summary: {
        deliveriesThisWeek: ordersThisWeek.length,
        overdueOrders: overdueOrders.length,
        pendingPayments: pendingPayments.length,
        overduePayments: overduePayments.length,
        criticalStock: criticalStockProducts.length,
        outOfStock: outOfStock.length,
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        totalOverdueAmount: Math.round(totalOverdueAmount * 100) / 100
      },
      urgentActions: topActions,
      ordersThisWeek: ordersThisWeek.map((order: OrderBaseWithIdType) => ({
        id: order._id,
        name: order.name,
        buyer: order.buyer,
        dueDate: order.dueDate,
        totalAmount: order.totalAmount,
        paid: order.paid,
        status: order.status
      })),
      overdueOrders: overdueOrders.slice(0, 10).map((order: any) => ({
        id: order._id,
        name: order.name,
        buyer: order.buyer,
        dueDate: order.dueDate,
        totalAmount: order.totalAmount,
        paid: order.paid,
        status: order.status,
        daysOverdue: order.daysOverdue
      })),
      pendingPayments: pendingPayments.slice(0, 10).map((order: any) => ({
        id: order._id,
        name: order.name,
        buyer: order.buyer,
        dueDate: order.dueDate,
        totalAmount: order.totalAmount,
        paid: order.paid,
        status: order.status,
        daysUntilDue: order.daysUntilDue
      })),
      criticalStock: criticalStockProducts.map((product: ProductBaseWithIdType) => ({
        id: product._id,
        uniqId: product.uniqId,
        name: product.name,
        color: product.color,
        size: product.size,
        quantity: product.quantity
      })),
      calendar: Object.entries(calendarData).map(([date, orders]) => ({
        date,
        count: orders.length,
        orders: orders.map((order: OrderBaseWithIdType) => ({
          id: order._id,
          name: order.name,
          totalAmount: order.totalAmount
        }))
      })),
      metadata: {
        timestamp: getNowInMexicoCity().toISOString(),
        timezone: "America/Mexico_City"
      }
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (error) {
    console.error("Weekly stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          devMessage: "Failed to fetch weekly statistics"
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        devMessage: "Unknown error in weekly statistics"
      },
      { status: 500 }
    );
  }
};
