import { z } from "zod";

export const MessageRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
});

export type MessageRepositoryFilter = z.infer<typeof MessageRepositoryFilterModel>;

export const MessageInputModel = z.object({
  phone_id: z.string(),
  message: z.string(),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
});

export type MessageInput = z.infer<typeof MessageInputModel>;

