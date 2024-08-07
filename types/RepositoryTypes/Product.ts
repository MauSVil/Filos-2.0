import { z } from "zod";

export const ProductRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
});

export type ProductRepositoryFilter = z.infer<typeof ProductRepositoryFilterModel>;

export const ProductInputModel = z.object({
  phone_id: z.string(),
  message: z.string(),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
});

export type ProductInput = z.infer<typeof ProductInputModel>;

