/**
 * Helper para enviar notificaciones push con Expo
 *
 * NOTA: Necesitas instalar la dependencia primero:
 *   npm install expo-server-sdk
 */

import { Expo, ExpoPushMessage } from "expo-server-sdk";

interface PushNotification {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Envía notificaciones push usando Expo Push Notifications
 */
export async function sendPushNotifications(notifications: PushNotification[]) {
  const expo = new Expo();

  // Filtrar tokens válidos
  const validNotifications = notifications.filter(notif => {
    if (!Expo.isExpoPushToken(notif.token)) {
      console.warn(`⚠️  Token inválido: ${notif.token}`);
      return false;
    }
    return true;
  });

  if (validNotifications.length === 0) {
    console.warn("⚠️  No hay tokens válidos de Expo");
    return { sent: 0, errors: [] };
  }

  // Crear mensajes
  const messages: ExpoPushMessage[] = validNotifications.map(notif => ({
    to: notif.token,
    sound: "default",
    title: notif.title,
    body: notif.body,
    data: notif.data || {},
    priority: "high" as const,
    channelId: "default"
  }));

  // Enviar en chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  const errors: Array<{ token?: string; error: string }> = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);

      // Verificar errores en los tickets
      ticketChunk.forEach((ticket, idx) => {
        if (ticket.status === "error") {
          errors.push({
            token: chunk[idx].to as string,
            error: ticket.message
          });
        }
      });
    } catch (error) {
      console.error("Error enviando chunk:", error);
      errors.push({ error: String(error) });
    }
  }

  return {
    sent: tickets.filter(t => t.status === "ok").length,
    errors
  };
}
