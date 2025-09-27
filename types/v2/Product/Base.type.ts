import { ObjectId } from "mongodb";
import { z } from "zod";

export const ProductBase = z.object({
  _id: z.string(),
  baseId: z.string(),
  uniqId: z.string(),
  color: z.string(),
  name: z.string(),
  webPagePrice: z.coerce.number(),
  wholesalePrice: z.coerce.number(),
  retailPrice: z.coerce.number(),
  specialPrice: z.coerce.number(),
  quantity: z.coerce.number(),
  size: z.string(),
  image: z.string().url(),
  minioImage: z.string().url().optional(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
});
export type ProductBaseType = z.infer<typeof ProductBase>;

export const ProductBaseWithId = ProductBase.extend({
  _id: z.instanceof(ObjectId),
});
export type ProductBaseWithIdType = z.infer<typeof ProductBaseWithId>;

export const ProductInput = ProductBase.omit({
  _id: true,
});
export type ProductInputType = z.infer<typeof ProductInput>;

export const ProductUpdate = ProductBase.omit({ _id: true }).partial();
export type ProductUpdateType = z.infer<typeof ProductUpdate>;