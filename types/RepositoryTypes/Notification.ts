import { z } from "zod";

export const NotificationRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
  page: z.number().optional(),
});

export type NotificationRepositoryFilter = z.infer<
  typeof NotificationRepositoryFilterModel
>;

export const NotificationModel = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  read: z.boolean(),
  timestamp: z.coerce.date(),
  metadata: z.object({
    conversationId: z.string().optional(),
    type: z.string().optional(),
  }),
});

export type Notification = z.infer<typeof NotificationModel>;

export const NotificationInputModel = z.object({
  phone_id: z.string(),
  message: z.string(),
  role: z.enum(["user", "assistant"]),
  timestamp: z.date(),
});

export type NotificationInput = z.infer<typeof NotificationInputModel>;
