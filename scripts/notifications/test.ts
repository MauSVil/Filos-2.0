/**
 * Script de prueba para verificar la configuración
 *
 * Uso:
 *   npx tsx scripts/notifications/test.ts
 */

import { connectToDatabase, closeDatabase } from "./db";

async function test() {
  console.log("🧪 Iniciando test de configuración...\n");

  try {
    // Test 1: Conexión a MongoDB
    console.log("1️⃣ Test de conexión a MongoDB...");
    const db = await connectToDatabase();
    console.log(`   ✅ Conectado a: ${db.databaseName}\n`);

    // Test 2: Verificar colecciones
    console.log("2️⃣ Verificando colecciones...");
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const required = ["users", "notificationLogs"];
    const missing = required.filter(name => !collectionNames.includes(name));

    if (missing.length > 0) {
      console.log(`   ⚠️  Colecciones faltantes: ${missing.join(", ")}`);
      console.log(`   💡 Créalas con: db.createCollection("${missing[0]}")\n`);
    } else {
      console.log(`   ✅ Todas las colecciones requeridas existen\n`);
    }

    // Test 3: Verificar usuarios admin con pushToken
    console.log("3️⃣ Verificando usuarios admin con pushToken...");
    const adminUsers = await db
      .collection("users")
      .find({
        role: "admin",
        pushToken: { $exists: true, $ne: null }
      })
      .toArray();

    console.log(`   👤 Usuarios admin con pushToken: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log(`   ⚠️  No hay usuarios admin con pushToken configurado`);
      console.log(`   💡 Agrega un pushToken a tu usuario admin:\n`);
      console.log(`   db.users.updateOne(`);
      console.log(`     { email: "tu-email@example.com" },`);
      console.log(`     { $set: { pushToken: "ExponentPushToken[xxx]" } }`);
      console.log(`   )\n`);
    } else {
      adminUsers.forEach((user: any, i: number) => {
        const tokenPreview = user.pushToken.substring(0, 30);
        console.log(`   ${i + 1}. ${user.name} (${user.email})`);
        console.log(`      Token: ${tokenPreview}...`);
      });
      console.log();
    }

    // Test 4: Variables de entorno
    console.log("4️⃣ Verificando variables de entorno...");
    const envVars = {
      "PUSH_SERVICE": process.env.PUSH_SERVICE || "no configurado",
      "MONGODB_DB_NAME": process.env.MONGODB_DB_NAME || "no configurado",
      "ALWAYS_NOTIFY": process.env.ALWAYS_NOTIFY || "false"
    };

    Object.entries(envVars).forEach(([key, value]) => {
      const icon = value !== "no configurado" ? "✅" : "⚠️ ";
      console.log(`   ${icon} ${key}: ${value}`);
    });

    console.log("\n✨ Test completado!");
    console.log("\n📝 Próximos pasos:");
    console.log("   1. Instalar dependencia: npm install expo-server-sdk");
    console.log("   2. Agregar pushToken a tu usuario admin (desde tu app móvil)");
    console.log("   3. Ejecutar el script: npm run notify:daily");
    console.log("   4. Configurar en Coolify Scheduled Tasks\n");

    // Cerrar conexión a MongoDB
    await closeDatabase();

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);

    // Cerrar conexión a MongoDB incluso si hay error
    await closeDatabase();

    process.exit(1);
  }
}

test();
