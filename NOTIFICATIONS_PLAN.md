# 📱 Plan de Implementación - Push Notifications

Sistema de notificaciones push para alertas automáticas diarias desde Coolify.

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    Coolify Server                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Cron Job (8:00 AM diario)                            │  │
│  │ */5 * * * * curl http://localhost:3000/api/cron/daily│  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Next.js API: /api/cron/daily                         │  │
│  │ - Verifica secret token                              │  │
│  │ - Llama a /api/v2/stats/dashboard/weekly            │  │
│  │ - Analiza urgencias                                   │  │
│  │ - Envía push notifications                            │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   Firebase Cloud Messaging      │
        │   (o Expo Push / OneSignal)     │
        └─────────────────┬───────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   Tu App      │
                  │   Móvil       │
                  └───────────────┘
```

---

## 🔑 Decisiones Técnicas

### 1. ¿Qué tecnología usa tu app móvil?

**Opción A: React Native con Expo**
- ✅ Más fácil: Expo Push Notifications
- ✅ No requiere Firebase
- ✅ Gratis hasta 1M notificaciones/mes
- 📦 `expo-notifications`

**Opción B: React Native sin Expo**
- Firebase Cloud Messaging (FCM)
- 📦 `@react-native-firebase/messaging`

**Opción C: Flutter**
- Firebase Cloud Messaging
- 📦 `firebase_messaging`

**Opción D: Native (Swift/Kotlin)**
- Firebase Cloud Messaging
- O servicio nativo de Apple/Google

### 2. Servicio de Push Recomendado

| Servicio | Pros | Contras | Precio |
|----------|------|---------|--------|
| **Expo Push** | Muy fácil, sin config | Solo Expo | Gratis |
| **Firebase FCM** | Universal, confiable | Más setup | Gratis |
| **OneSignal** | Dashboard bonito | Overkill | Gratis básico |
| **Pushover** | Simple, directo | No escalable | $5 one-time |

**Recomendación**:
- Si usas Expo → **Expo Push Notifications**
- Si no → **Firebase Cloud Messaging (FCM)**

---

## 📋 Implementación Paso a Paso

### Fase 1: Setup de Push Notifications (1-2 horas)

#### Si usas Expo:

1. **Instalar dependencias**
```bash
npx expo install expo-notifications expo-device expo-constants
```

2. **Configurar en app móvil**
```typescript
// App.tsx o similar
import * as Notifications from 'expo-notifications';

async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Necesitas habilitar notificaciones!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push Token:', token);

  // Enviar token al backend
  await fetch('https://tu-api.com/api/push/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, userId: 'TU_USER_ID' })
  });
}
```

3. **Guardar token en MongoDB**
```typescript
// Nueva colección: pushTokens
{
  _id: ObjectId,
  userId: string,
  token: string, // Expo push token
  platform: 'ios' | 'android',
  createdAt: Date,
  lastUsed: Date
}
```

#### Si usas Firebase:

1. **Setup Firebase**
```bash
npm install firebase-admin
```

2. **Obtener service account JSON**
- Firebase Console → Project Settings → Service Accounts
- Generate new private key
- Guardar como `firebase-service-account.json`

3. **Inicializar en Next.js**
```typescript
// lib/firebase-admin.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export const messaging = admin.messaging();
```

---

### Fase 2: API Endpoints (2-3 horas)

#### 1. Endpoint para registrar token

```typescript
// app/api/push/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/mongodb';

export async function POST(req: NextRequest) {
  const { token, userId, platform } = await req.json();

  const db = await connectToDatabase();
  const collection = db.collection('pushTokens');

  // Upsert token
  await collection.updateOne(
    { userId },
    {
      $set: {
        token,
        platform,
        lastUsed: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
```

#### 2. Endpoint para enviar notificaciones

```typescript
// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export async function POST(req: NextRequest) {
  const { token, title, body, data } = await req.json();

  if (!Expo.isExpoPushToken(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const messages: ExpoPushMessage[] = [{
    to: token,
    sound: 'default',
    title,
    body,
    data: data || {},
    priority: 'high'
  }];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return NextResponse.json({ success: true, tickets });
}
```

#### 3. Cron endpoint principal

```typescript
// app/api/cron/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/mongodb';

export async function GET(req: NextRequest) {
  // Verificar secret para seguridad
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Obtener datos del weekly dashboard
    const weeklyRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v2/stats/dashboard/weekly`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const weeklyData = await weeklyRes.json();

    // 2. Analizar urgencias
    const urgencies = analyzeUrgencies(weeklyData);

    // 3. Obtener push tokens
    const db = await connectToDatabase();
    const tokens = await db.collection('pushTokens').find({}).toArray();

    // 4. Enviar notificaciones
    for (const token of tokens) {
      if (urgencies.length > 0) {
        await sendNotification(token.token, urgencies);
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent: tokens.length,
      urgencies: urgencies.length
    });

  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

function analyzeUrgencies(data: any) {
  const urgencies = [];

  // Órdenes vencidas
  if (data.summary.overdueOrders > 0) {
    urgencies.push({
      type: 'overdue_orders',
      priority: 'high',
      message: `${data.summary.overdueOrders} entregas atrasadas`
    });
  }

  // Pagos vencidos
  if (data.summary.overduePayments > 0) {
    urgencies.push({
      type: 'overdue_payments',
      priority: 'high',
      message: `${data.summary.overduePayments} pagos vencidos ($${data.summary.totalOverdueAmount.toFixed(2)})`
    });
  }

  // Entregas hoy o mañana
  const deliveriesToday = data.ordersThisWeek.filter((order: any) => {
    const dueDate = new Date(order.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return dueDate.toDateString() === today.toDateString() ||
           dueDate.toDateString() === tomorrow.toDateString();
  });

  if (deliveriesToday.length > 0) {
    urgencies.push({
      type: 'upcoming_deliveries',
      priority: 'medium',
      message: `${deliveriesToday.length} entregas próximas`
    });
  }

  // Stock crítico
  if (data.summary.outOfStock > 0) {
    urgencies.push({
      type: 'out_of_stock',
      priority: 'medium',
      message: `${data.summary.outOfStock} productos sin stock`
    });
  }

  return urgencies;
}

async function sendNotification(token: string, urgencies: any[]) {
  const highPriority = urgencies.filter(u => u.priority === 'high');
  const mediumPriority = urgencies.filter(u => u.priority === 'medium');

  let title = '☀️ Buenos días!';
  let body = '';

  if (highPriority.length > 0) {
    title = '⚠️ Acciones urgentes';
    body = highPriority.map(u => u.message).join('\n');
  } else if (mediumPriority.length > 0) {
    body = mediumPriority.map(u => u.message).join('\n');
  } else {
    body = 'Todo está bajo control hoy 🎉';
  }

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, title, body, data: { urgencies } })
  });
}
```

---

### Fase 3: Configurar Cron en Coolify (30 minutos)

#### Opción A: Cron Job en Coolify

1. **Abrir configuración de tu servicio en Coolify**

2. **Agregar Custom Command** en la sección de Post Deployment:
```bash
# Agregar a crontab del contenedor
echo "0 8 * * * curl -H 'Authorization: Bearer TU_CRON_SECRET' http://localhost:3000/api/cron/daily" >> /etc/cron.d/daily-notifications
```

3. **O usar Coolify Scheduled Tasks**:
- Name: `daily-notifications`
- Schedule: `0 8 * * *` (8 AM diario)
- Command:
  ```bash
  curl -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/daily
  ```

#### Opción B: Servicio externo (más confiable)

**Usar cron-job.org**:
1. Crear cuenta en https://cron-job.org
2. New Cronjob:
   - URL: `https://tu-dominio.com/api/cron/daily`
   - Schedule: `0 8 * * *`
   - Headers: `Authorization: Bearer TU_SECRET`
3. Gratis, confiable, con logs

---

### Fase 4: Testing (1 hora)

#### 1. Test manual del endpoint
```bash
curl -X GET \
  -H "Authorization: Bearer tu-secret" \
  http://localhost:3000/api/cron/daily
```

#### 2. Test de notificación directa
```typescript
// Test en app móvil o Postman
POST http://localhost:3000/api/push/send
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Test",
  "body": "Funciona!",
  "data": {}
}
```

#### 3. Test de registro de token
```typescript
// Desde app móvil
POST http://localhost:3000/api/push/register
{
  "userId": "admin",
  "token": "ExponentPushToken[xxx]",
  "platform": "ios"
}
```

---

## 📦 Dependencias Necesarias

### Para Next.js (Backend):
```bash
npm install expo-server-sdk
# O si usas Firebase:
npm install firebase-admin
```

### Variables de Entorno (.env):
```bash
# Para Expo Push
EXPO_ACCESS_TOKEN=tu-token-opcional

# Para Firebase (si usas)
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=tu-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Para Cron
CRON_SECRET=genera-un-string-aleatorio-seguro
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 📱 Tipos de Notificaciones

### 1. **Notificación Matutina (8:00 AM)**
```
☀️ Buenos días!
• 0 entregas hoy
• 2 pagos vencidos ($2,560)
• 20 productos con stock bajo
```

### 2. **Urgencias Críticas**
```
⚠️ Acciones urgentes
• 3 entregas atrasadas
• 5 pagos vencidos ($8,450)
```

### 3. **Todo Bien**
```
☀️ Buenos días!
Todo está bajo control hoy 🎉
```

### 4. **Recordatorios Específicos**
```
🔔 Recordatorio
Orden "KARY RIVERA" vence mañana
Total: $1,760
```

---

## ⚙️ Configuración Avanzada (Opcional)

### Múltiples horarios de notificación:

```bash
# Mañana (8 AM) - Resumen del día
0 8 * * * curl ...

# Mediodía (1 PM) - Recordatorio si hay urgencias
0 13 * * * curl ...

# Tarde (5 PM) - Resumen antes de cerrar
0 17 * * * curl ...
```

### Notificaciones condicionales:

Solo notificar si:
- Hay urgencias (pagos vencidos, entregas atrasadas)
- Es día laboral (lunes-viernes)
- Hay cambios desde ayer

### Deep Links en notificaciones:

```typescript
const messages: ExpoPushMessage[] = [{
  to: token,
  sound: 'default',
  title: '2 pagos vencidos',
  body: 'Toca para ver detalles',
  data: {
    screen: 'OrdersList',
    filter: 'overdue_payments'
  }
}];
```

En la app móvil:
```typescript
Notifications.addNotificationResponseReceivedListener(response => {
  const { screen, filter } = response.notification.request.content.data;
  navigation.navigate(screen, { filter });
});
```

---

## 🔐 Seguridad

1. **Proteger el endpoint de cron**:
```typescript
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

2. **Rate limiting** (opcional):
```typescript
// Prevenir spam
const lastRun = await db.collection('cronLogs').findOne({ type: 'daily' });
if (lastRun && new Date().getTime() - lastRun.timestamp < 3600000) {
  return NextResponse.json({ error: 'Too soon' }, { status: 429 });
}
```

3. **Logging**:
```typescript
await db.collection('cronLogs').insertOne({
  type: 'daily',
  timestamp: new Date(),
  success: true,
  notificationsSent: tokens.length
});
```

---

## 📊 Métricas a Trackear

- Notificaciones enviadas por día
- Tasa de apertura (si la app lo soporta)
- Errores de envío
- Tokens inválidos/expirados
- Tiempo de ejecución del cron

---

## ❓ Preguntas para ti

Para implementar esto necesito saber:

1. **¿Qué tecnología usa tu app móvil?**
   - [ ] React Native con Expo
   - [ ] React Native sin Expo
   - [ ] Flutter
   - [ ] Otra: ___________

2. **¿Ya tienes Firebase configurado?**
   - [ ] Sí
   - [ ] No

3. **¿Prefieres usar Expo Push o Firebase FCM?**
   - [ ] Expo Push (más fácil)
   - [ ] Firebase (más universal)

4. **¿A qué hora quieres las notificaciones?**
   - [ ] 8:00 AM
   - [ ] Otra: ___________

5. **¿Quieres notificaciones solo si hay urgencias o diario siempre?**
   - [ ] Solo si hay urgencias
   - [ ] Diario siempre (incluso si todo está bien)

---

**¿Listo para implementarlo?** Dame la info de tu app móvil y empezamos! 🚀
