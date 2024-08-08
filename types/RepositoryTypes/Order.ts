import { z } from "zod";

export const OrderRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
  page: z.number().optional(),
});

export type OrderRepositoryFilter = z.infer<typeof OrderRepositoryFilterModel>;

export const OrderInputModel = z.object({
  phone_id: z.string(),
  message: z.string(),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
});

export type OrderInput = z.infer<typeof OrderInputModel>;

