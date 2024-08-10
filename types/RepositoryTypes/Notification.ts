import { z } from "zod";

export const NotificationRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
  page: z.number().optional(),
});

export type NotificationRepositoryFilter = z.infer<typeof NotificationRepositoryFilterModel>;

export const NotificationInputModel = z.object({
  phone_id: z.string(),
  message: z.string(),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
});

export type NotificationInput = z.infer<typeof NotificationInputModel>;

