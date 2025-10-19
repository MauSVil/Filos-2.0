/**
 * Script para verificar la configuración del timezone
 *
 * Uso:
 *   npx tsx scripts/check-timezone.ts
 */

import { getNowInMexicoCity, formatDateMX } from "@/utils/timezone";
import moment from "moment-timezone";

console.log("🌎 Verificando configuración de Timezone...\n");

// 1. Verificar variable de entorno TZ
console.log("1️⃣ Variable de entorno TZ:");
const tzEnv = process.env.TZ;
if (tzEnv) {
  console.log(`   ✅ TZ=${tzEnv}`);
} else {
  console.log(`   ⚠️  TZ no está configurada`);
  console.log(`   💡 Agrega TZ=America/Mexico_City a las variables de entorno\n`);
}

// 2. Verificar timezone del sistema
console.log("\n2️⃣ Timezone del sistema:");
const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(`   Timezone detectado: ${systemTimezone}`);
if (systemTimezone === "America/Mexico_City") {
  console.log(`   ✅ Sistema configurado en Mexico_City`);
} else {
  console.log(`   ⚠️  Sistema NO está en Mexico_City (está en: ${systemTimezone})`);
}

// 3. Fecha y hora actual
console.log("\n3️⃣ Fecha y hora actual:");
const now = new Date();
const nowMX = getNowInMexicoCity();

console.log(`   Sistema (Date):     ${now.toISOString()}`);
console.log(`   Sistema (local):    ${now.toLocaleString("es-MX")}`);
console.log(`   Mexico_City:        ${formatDateMX(nowMX, "DD/MM/YYYY HH:mm:ss")}`);
console.log(`   Moment-timezone:    ${moment.tz("America/Mexico_City").format("DD/MM/YYYY HH:mm:ss")}`);

// 4. Verificar offset UTC
console.log("\n4️⃣ Offset UTC:");
const offset = moment.tz("America/Mexico_City").format("Z");
const isDST = moment.tz("America/Mexico_City").isDST();
console.log(`   Offset:             ${offset}`);
console.log(`   Horario de verano:  ${isDST ? "Sí (UTC-5)" : "No (UTC-6)"}`);

// 5. Hora del sistema vs Mexico_City
console.log("\n5️⃣ Comparación de horas:");
const systemHour = now.getHours();
const mxHour = nowMX.getHours();
console.log(`   Hora del sistema:   ${systemHour}:${now.getMinutes()}`);
console.log(`   Hora Mexico_City:   ${mxHour}:${nowMX.getMinutes()}`);

if (systemHour === mxHour) {
  console.log(`   ✅ Las horas coinciden (timezone correcto)`);
} else {
  const diff = Math.abs(systemHour - mxHour);
  console.log(`   ⚠️  Diferencia de ${diff} hora(s) - el sistema NO está en Mexico_City`);
}

// 6. Simulación de cron
console.log("\n6️⃣ Simulación de ejecución de cron:");
console.log(`   Si el cron está configurado como: 0 8 * * *`);
console.log(`   Se ejecutará a las 8:00 AM ${systemTimezone}`);

if (systemTimezone === "America/Mexico_City") {
  console.log(`   ✅ Esto es correcto - será 8:00 AM Mexico_City`);
} else if (systemTimezone === "UTC") {
  console.log(`   ⚠️  8:00 AM UTC = ${isDST ? "2:00" : "3:00"} AM Mexico_City`);
  console.log(`   💡 Para ejecutar a las 8 AM Mexico_City, usa: 0 ${isDST ? 13 : 14} * * *`);
  console.log(`   💡 O mejor: configura TZ=America/Mexico_City`);
} else {
  console.log(`   ⚠️  El timezone ${systemTimezone} es diferente a Mexico_City`);
}

// 7. Resumen
console.log("\n📋 Resumen:");
const allGood =
  tzEnv === "America/Mexico_City" && systemTimezone === "America/Mexico_City" && systemHour === mxHour;

if (allGood) {
  console.log(`   ✅ TODO ESTÁ CORRECTO`);
  console.log(`   ✅ El timezone está configurado en America/Mexico_City`);
  console.log(`   ✅ Los cron jobs se ejecutarán en horario de México`);
} else {
  console.log(`   ⚠️  ACCIÓN REQUERIDA:`);
  if (!tzEnv) {
    console.log(`   - Agrega TZ=America/Mexico_City a las variables de entorno`);
  }
  if (systemTimezone !== "America/Mexico_City") {
    console.log(`   - Reinicia el contenedor después de agregar TZ`);
  }
  if (systemHour !== mxHour) {
    console.log(`   - Si TZ ya está configurada, verifica el deploy`);
  }
}

console.log("\n✨ Verificación completada\n");
