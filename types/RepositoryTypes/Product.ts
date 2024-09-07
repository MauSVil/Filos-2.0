import { z } from "zod";

export const ProductRepositoryFilterModel = z.object({
  ids: z.array(z.string()).optional(),
  id: z.string().optional(),
  q: z.string().optional(),
  disponibility: z.string().optional(),
  page: z.number().optional(),
});

export type ProductRepositoryFilter = z.infer<typeof ProductRepositoryFilterModel>;

export const ProductInputModel = z.object({
  phone_id: z.string(),
  message: z.string(),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
});

export type ProductInput = z.infer<typeof ProductInputModel>;

