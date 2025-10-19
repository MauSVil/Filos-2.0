# 🌎 Sistema de Timezone - Mexico City

Este proyecto usa **America/Mexico_City** como timezone única para todas las operaciones de fecha.

## 🎯 Por qué es importante

JavaScript por defecto usa la zona horaria del sistema donde se ejecuta el código:
- En tu computadora local: Puede ser Mexico_City
- En el servidor (Coolify/Docker): Probablemente es UTC
- En el navegador del usuario: La zona horaria local del usuario

Esto causa problemas:
- Una orden con fecha de entrega "2025-10-18" puede interpretarse diferente en el servidor vs el cliente
- Los filtros de "esta semana" pueden estar desfasados 6-7 horas
- Las notificaciones pueden enviarse con datos del día equivocado

## ✅ Solución

Todas las operaciones de fecha usan las utilidades en `/utils/timezone.ts` que garantizan que **siempre** se use `America/Mexico_City`.

## 📚 Funciones Disponibles

### Fechas del día actual

```typescript
import { getTodayStartInMexicoCity, getTodayEndInMexicoCity, getNowInMexicoCity } from "@/utils/timezone";

// Inicio del día actual (00:00:00.000)
const today = getTodayStartInMexicoCity();

// Fin del día actual (23:59:59.999)
const endOfDay = getTodayEndInMexicoCity();

// Fecha y hora actual
const now = getNowInMexicoCity();
```

### Fechas de la semana

```typescript
import { getStartOfWeekInMexicoCity, getEndOfWeekInMexicoCity } from "@/utils/timezone";

// Inicio de la semana (lunes 00:00:00.000)
const startOfWeek = getStartOfWeekInMexicoCity();

// Fin de la semana (domingo 23:59:59.999)
const endOfWeek = getEndOfWeekInMexicoCity();
```

### Cálculos con fechas

```typescript
import { getDaysDifference, isToday, isTomorrow, isThisWeek } from "@/utils/timezone";

// Calcular días de diferencia
const daysLate = getDaysDifference(today, order.dueDate); // 5 días
const daysUntilDue = getDaysDifference(order.dueDate, today); // -5 días (negativo = vencido)

// Verificaciones
if (isToday(order.dueDate)) {
  console.log("¡Entrega hoy!");
}

if (isTomorrow(order.dueDate)) {
  console.log("Entrega mañana");
}

if (isThisWeek(order.dueDate)) {
  console.log("Entrega esta semana");
}
```

### Formateo de fechas

```typescript
import { formatDateMX } from "@/utils/timezone";

// Formato corto
formatDateMX(order.dueDate); // "18/10/2025"

// Formato largo
formatDateMX(order.dueDate, "DD/MM/YYYY HH:mm"); // "18/10/2025 14:30"

// Formato personalizado
formatDateMX(order.dueDate, "dddd, DD [de] MMMM [de] YYYY"); // "viernes, 18 de octubre de 2025"
```

## 🔧 Uso en API Routes

```typescript
// ❌ INCORRECTO
export const GET = async () => {
  const today = new Date(); // Usa timezone del servidor (UTC)
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  // ... más cálculos manuales
};

// ✅ CORRECTO
import { getTodayStartInMexicoCity, getStartOfWeekInMexicoCity } from "@/utils/timezone";

export const GET = async () => {
  const today = getTodayStartInMexicoCity();
  const startOfWeek = getStartOfWeekInMexicoCity();

  // Las fechas ya están en Mexico_City timezone
};
```

## 🔧 Uso en Scripts

```typescript
// ❌ INCORRECTO
async function main() {
  console.log(`Fecha: ${new Date().toLocaleString("es-MX")}`); // Puede variar

  const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

// ✅ CORRECTO
import { getNowInMexicoCity, formatDateMX, getDaysDifference } from "@/utils/timezone";

async function main() {
  console.log(`Fecha: ${formatDateMX(getNowInMexicoCity(), "DD/MM/YYYY, HH:mm:ss")} (Mexico City)`);

  const daysLate = getDaysDifference(today, dueDate);
}
```

## 🎨 Uso en Componentes UI

```typescript
// En componentes React
import { formatDateMX, isToday, isTomorrow } from "@/utils/timezone";

function OrderCard({ order }) {
  const dueDateFormatted = formatDateMX(order.dueDate, "DD/MM/YYYY");

  const urgencyBadge = isToday(order.dueDate)
    ? <Badge variant="destructive">Hoy</Badge>
    : isTomorrow(order.dueDate)
    ? <Badge variant="warning">Mañana</Badge>
    : null;

  return (
    <Card>
      <p>Entrega: {dueDateFormatted}</p>
      {urgencyBadge}
    </Card>
  );
}
```

## 📋 Archivos Actualizados

Los siguientes archivos ya usan el sistema de timezone:

- ✅ `/app/api/v2/stats/dashboard/weekly/route.ts` - API del dashboard
- ✅ `/scripts/notifications/daily.ts` - Script de notificaciones diarias

## ⚠️ Importante

1. **Siempre usa las utilidades** en lugar de `new Date()` cuando trabajes con comparaciones de días
2. **Para timestamps de auditoría** (createdAt, updatedAt): Puedes seguir usando `new Date()` y guardar en ISO format
3. **Para fechas de negocio** (dueDate, deliveryDate): Siempre usa las utilidades de timezone
4. **En MongoDB**: Las fechas se guardan en UTC, pero las utilidades las convierten a Mexico_City para comparaciones

## 🔍 Ejemplo Completo

```typescript
import {
  getTodayStartInMexicoCity,
  getStartOfWeekInMexicoCity,
  getEndOfWeekInMexicoCity,
  getDaysDifference,
  isToday,
  formatDateMX
} from "@/utils/timezone";

async function analyzeOrders() {
  const today = getTodayStartInMexicoCity();
  const startOfWeek = getStartOfWeekInMexicoCity();
  const endOfWeek = getEndOfWeekInMexicoCity();

  const orders = await OrderRepository.find({ status: "Pendiente" });

  // Filtrar órdenes de esta semana
  const ordersThisWeek = orders.filter(order => {
    const dueDate = new Date(order.dueDate);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });

  // Órdenes atrasadas
  const overdueOrders = orders
    .filter(order => new Date(order.dueDate) < today)
    .map(order => ({
      ...order,
      daysLate: getDaysDifference(today, order.dueDate),
      isToday: isToday(order.dueDate),
      formattedDate: formatDateMX(order.dueDate, "DD/MM/YYYY")
    }));

  return {
    thisWeek: ordersThisWeek,
    overdue: overdueOrders
  };
}
```

## 🚀 Siguiente Paso

Si necesitas agregar más utilidades de fecha, agrégalas a `/utils/timezone.ts` para mantener todo centralizado.

---

**Última actualización**: 18 de octubre, 2025
