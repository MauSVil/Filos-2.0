# 📱 Sistema de Notificaciones Push

Scripts para enviar notificaciones push automáticas desde Coolify Scheduled Tasks.

---

## 🏗️ Arquitectura

```
Coolify Cron (8:00 AM diario)
    ↓
Script: daily.ts
    ↓
1. Consulta MongoDB directamente
2. Calcula stats semanales
3. Analiza urgencias
4. Envía push via Expo/Firebase
    ↓
App Móvil 📱
```

---

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install expo-server-sdk
# O si usas Firebase:
npm install firebase-admin
```

### 2. Configurar variables de entorno

Agregar a tu `.env`:

```bash
# Push Notifications
PUSH_SERVICE=expo  # o 'firebase'

# Solo si usas Expo (opcional)
EXPO_ACCESS_TOKEN=tu-token-aqui

# Solo si usas Firebase
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=tu-client-email@example.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# MongoDB
MONGODB_DB_NAME=test

# Comportamiento
ALWAYS_NOTIFY=false  # true para enviar siempre, incluso sin urgencias
```

### 3. Agregar pushToken a tu usuario admin

El script usa el campo `pushToken` del usuario en la colección `users`.

Desde MongoDB Compass o CLI:

```javascript
// Actualizar tu usuario admin con el pushToken
db.users.updateOne(
  { email: "maujr10@hotmail.com" },
  {
    $set: {
      pushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    }
  }
);

// Verificar que se actualizó
db.users.findOne({ email: "maujr10@hotmail.com" });
```

**Estructura esperada del usuario**:
```javascript
{
  "_id": ObjectId("..."),
  "name": "Mauricio Sanchez Vilchis",
  "email": "maujr10@hotmail.com",
  "password": "$2b$10$...",
  "role": "admin",
  "pushToken": "ExponentPushToken[4Vucn_OSP9bhQbK2Ebj3-h]"
}
```

---

## 🚀 Uso

### Ejecutar manualmente

```bash
# Desarrollo
npx tsx scripts/notifications/daily.ts

# Producción
npm run notify:daily
```

### Configurar en Coolify

#### Opción 1: Scheduled Task (Recomendado)

En Coolify → Tu Servicio → Scheduled Tasks:

```bash
# Nombre
Daily Push Notifications

# Schedule (Cron)
0 8 * * *

# Command
cd /app && npx tsx scripts/notifications/daily.ts

# Enabled
✓
```

**Explicación del cron**:
- `0 8 * * *` = Todos los días a las 8:00 AM
- `*/5 * * * *` = Cada 5 minutos (para testing)
- `0 8,13,17 * * *` = A las 8 AM, 1 PM y 5 PM

#### Opción 2: Docker Entrypoint (Avanzado)

Modificar tu `Dockerfile` o entrypoint para incluir cron:

```dockerfile
# Instalar cron
RUN apt-get update && apt-get install -y cron

# Agregar cron job
RUN echo "0 8 * * * cd /app && npx tsx scripts/notifications/daily.ts >> /var/log/cron.log 2>&1" > /etc/cron.d/notifications
RUN chmod 0644 /etc/cron.d/notifications
RUN crontab /etc/cron.d/notifications

# Iniciar cron en el entrypoint
CMD cron && npm start
```

---

## 📊 Logging y Monitoreo

### Ver logs de ejecución

En Coolify:
1. Ir a tu servicio
2. Logs → Application Logs
3. Buscar `🔔 Iniciando script`

### Ejemplo de log exitoso:

```
🔔 Iniciando script de notificaciones diarias...
📅 Fecha: 18/10/2025, 8:00:00
✅ Conectado a MongoDB
📊 Obteniendo estadísticas...

📈 Resumen:
   • Entregas atrasadas: 0
   • Pagos vencidos: 2 ($2560.00)
   • Entregas próximas: 0
   • Entregas esta semana: 0
   • Productos sin stock: 0
   • Stock crítico: 20

🔍 Urgencias detectadas: 1
   🔴 [HIGH] 2 pagos vencidos ($2,560.00)

📱 Enviando notificación a 1 admin(s):
   • Mauricio Sanchez Vilchis (maujr10@hotmail.com)

   Título: ⚠️ Acciones urgentes
   Mensaje:
   • 2 pagos vencidos ($2,560.00)

   ✅ Enviadas: 1

✨ Script completado exitosamente
```

### Ver historial de notificaciones

En MongoDB:

```javascript
db.notificationLogs.find().sort({ timestamp: -1 }).limit(10);
```

Ejemplo de documento:

```json
{
  "_id": ObjectId("..."),
  "timestamp": ISODate("2025-10-18T13:00:00Z"),
  "title": "⚠️ Acciones urgentes",
  "body": "• 2 pagos vencidos ($2,560.00)",
  "urgencies": [
    {
      "type": "overdue_payments",
      "priority": "high",
      "message": "2 pagos vencidos ($2,560.00)",
      "count": 2,
      "amount": 2560
    }
  ],
  "recipients": [
    {
      "userId": "648743ae8589dd6451be37c8",
      "name": "Mauricio Sanchez Vilchis",
      "email": "maujr10@hotmail.com"
    }
  ],
  "recipientCount": 1,
  "sent": 1,
  "errors": [],
  "success": true
}
```

---

## 🧪 Testing

### 1. Test del script completo

```bash
npx tsx scripts/notifications/daily.ts
```

### 2. Test de envío de push (manual)

Crear un script de prueba:

```typescript
// scripts/notifications/test-send.ts
import { sendPushNotifications } from "./send-push";

async function test() {
  const result = await sendPushNotifications([
    {
      token: "ExponentPushToken[xxxxx]", // Tu token aquí
      title: "🧪 Test",
      body: "Si ves esto, funciona! ✅",
      data: { test: true }
    }
  ]);

  console.log("Resultado:", result);
}

test();
```

Ejecutar:
```bash
npx tsx scripts/notifications/test-send.ts
```

### 3. Test de conexión a MongoDB

```bash
# Verificar que se puede conectar
npx tsx -e "import { connectToDatabase } from './scripts/notifications/db'; connectToDatabase().then(db => console.log('Connected to:', db.databaseName))"
```

---

## 🔧 Configuración Avanzada

### Múltiples horarios

Crear múltiples scheduled tasks:

**Mañana (8 AM)** - Resumen completo:
```bash
0 8 * * * cd /app && npx tsx scripts/notifications/daily.ts
```

**Tarde (5 PM)** - Solo urgencias:
```bash
0 17 * * * cd /app && ONLY_URGENT=true npx tsx scripts/notifications/daily.ts
```

### Notificaciones solo en días laborales

```bash
# Lunes a viernes a las 8 AM
0 8 * * 1-5 cd /app && npx tsx scripts/notifications/daily.ts
```

### Diferentes configuraciones por entorno

```bash
# Staging - cada hora
0 * * * * cd /app && NODE_ENV=staging npx tsx scripts/notifications/daily.ts

# Production - 8 AM
0 8 * * * cd /app && NODE_ENV=production npx tsx scripts/notifications/daily.ts
```

---

## 🐛 Troubleshooting

### Error: "No hay usuarios admin con pushToken configurado"

**Problema**: No tienes un pushToken en tu usuario admin.

**Solución**:

1. **Desde tu app móvil**, obtén el token y actualiza el usuario:
```typescript
// En tu app móvil
const token = await Notifications.getExpoPushTokenAsync();

// Actualizar tu usuario (puedes hacer un endpoint para esto)
await fetch('https://tu-api.com/api/users/update-push-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer tu-jwt'
  },
  body: JSON.stringify({ pushToken: token.data })
});
```

2. **O manualmente en MongoDB**:
```javascript
db.users.updateOne(
  { email: "maujr10@hotmail.com" },
  { $set: { pushToken: "ExponentPushToken[xxx]" } }
);
```

### Error: "Invalid Expo push token"

**Problema**: El token no tiene el formato correcto.

**Solución**:
- Tokens de Expo comienzan con `ExponentPushToken[`
- Tokens de Firebase son alfanuméricos largos
- Verificar que `PUSH_SERVICE` sea correcto

### El cron no se ejecuta

**Problema**: Coolify no está ejecutando el scheduled task.

**Solución**:
1. Verificar que el task esté "Enabled"
2. Revisar los logs del contenedor
3. Probar manualmente dentro del contenedor:
```bash
docker exec -it tu-contenedor /bin/bash
cd /app
npx tsx scripts/notifications/daily.ts
```

### MongoDB connection error

**Problema**: No se puede conectar a MongoDB.

**Solución**:
1. Verificar que `MONGODB_URI` esté configurada
2. Verificar que MongoDB esté accesible desde el contenedor
3. Test de conexión:
```bash
docker exec -it tu-contenedor npx tsx -e "import clientPromise from './mongodb'; clientPromise.then(() => console.log('OK'))"
```

---

## 📋 Checklist de Deploy

- [ ] Instalar `expo-server-sdk` (o `firebase-admin`)
- [ ] Configurar variables de entorno en `.env`
- [ ] Agregar campo `pushToken` a tu usuario admin en MongoDB
- [ ] Test de configuración: `npx tsx scripts/notifications/test.ts`
- [ ] Test manual del script: `npm run notify:daily`
- [ ] Verificar que llegue la notificación a tu móvil
- [ ] Configurar Scheduled Task en Coolify (cron: `0 8 * * *`)
- [ ] Esperar a la próxima ejecución programada
- [ ] Verificar logs en Coolify
- [ ] Revisar `notificationLogs` en MongoDB para auditoría

---

## 🔗 Referencias

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Cron Expressions](https://crontab.guru/)
- [Coolify Docs](https://coolify.io/docs)

---

**Última actualización**: 18 de octubre, 2025
