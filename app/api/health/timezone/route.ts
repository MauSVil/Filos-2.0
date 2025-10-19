import { NextResponse } from "next/server";
import { getNowInMexicoCity, formatDateMX } from "@/utils/timezone";
import moment from "moment-timezone";

export const GET = async () => {
  const now = new Date();
  const nowMX = getNowInMexicoCity();

  return NextResponse.json({
    status: "ok",
    system: {
      // Timezone del sistema (proceso Node.js)
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Variable de entorno TZ
      envTZ: process.env.TZ || "not set",
      // Fecha del sistema (puede estar en UTC)
      systemDate: now.toISOString(),
      systemDateLocal: now.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })
    },
    mexicoCity: {
      // Usando nuestras utilidades
      currentTime: nowMX.toISOString(),
      formatted: formatDateMX(nowMX, "DD/MM/YYYY HH:mm:ss"),
      hour: nowMX.getHours(),
      // Usando moment-timezone directamente
      momentFormatted: moment.tz("America/Mexico_City").format("DD/MM/YYYY HH:mm:ss"),
      momentOffset: moment.tz("America/Mexico_City").format("Z"), // Offset UTC
      isDST: moment.tz("America/Mexico_City").isDST() // ¿Horario de verano?
    },
    verification: {
      // Verifica que el timezone del sistema sea Mexico_City
      isSystemMexicoCity: Intl.DateTimeFormat().resolvedOptions().timeZone === "America/Mexico_City",
      // Verifica que TZ esté configurado
      hasTZEnvVar: !!process.env.TZ,
      // Recomendación
      recommendation: Intl.DateTimeFormat().resolvedOptions().timeZone === "America/Mexico_City"
        ? "✅ Timezone configurado correctamente"
        : "⚠️ Considera agregar TZ=America/Mexico_City a las variables de entorno"
    }
  });
};
