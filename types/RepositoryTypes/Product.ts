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
  _id: z.string().optional(),
  quantity: z.number(),
});

export type ProductInput = z.infer<typeof ProductInputModel>;

