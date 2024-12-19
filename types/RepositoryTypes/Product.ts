import { z } from "zod";

export const ProductRepositoryFilterModel = z.object({
  ids: z.array(z.string()).optional(),
  id: z.string().optional(),
  q: z.string().optional(),
  disponibility: z.string().optional(),
  page: z.number().optional(),
  uniqId: z.string().optional(),
  baseId: z.string().optional(),
});

export type ProductRepositoryFilter = z.infer<typeof ProductRepositoryFilterModel>;

export const ProductInputModel = z.object({
  _id: z.string().optional(),
  quantity: z.number(),
  specialPrice: z.coerce.number(),
  wholesalePrice: z.coerce.number(),
  retailPrice: z.coerce.number(),
  webPagePrice: z.coerce.number(),
});

export type ProductInput = z.infer<typeof ProductInputModel>;

