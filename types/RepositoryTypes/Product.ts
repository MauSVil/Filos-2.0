import { z } from "zod";


export const ProductModel = z.object({
  _id: z.string().optional(),
  baseId: z.string().regex(/^M-\d{4}$/, {
    message: "El formato debe ser 'M-3012', con una 'M', un guion y cuatro números.",
  }),
  uniqId: z.string(),
  color: z.string(),
  name: z.string(),
  webPagePrice: z.number(),
  wholesalePrice: z.number(),
  retailPrice: z.number(),
  specialPrice: z.number(),
  quantity: z.number(),
  size: z.string(),
  deleted_at: z.union([z.null(), z.date()]).optional(),
  image: z.string().optional(),
  updated_at: z.date().optional(),
})

export type Product = z.infer<typeof ProductModel>;

export const ProductClient = ProductModel.and(z.object({
  image: z.instanceof(File).or(z.string()).optional(),
}))

export type ProductClient = z.infer<typeof ProductClient>;

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

