import { z } from "zod";
import { Meilisearch } from "../Meilisearch";

export const ProductSchema = z.object({
  _id: z.string().optional(),
  baseId: z.string(),
  uniqId: z.string(),
  color: z.string(),
  name: z.string(),
  webPagePrice: z.coerce.number().int(),
  wholesalePrice: z.coerce.number().int(),
  retailPrice: z.coerce.number().int(),
  specialPrice: z.coerce.number().int(),
  quantity: z.coerce.number().int(),
  size: z.string(),
  deleted_at: z.nullable(z.coerce.date()),
  image: z.string().url(),
  minioImage: z.string().url(),
  updated_at: z.coerce.date(),
});

export type Product = z.infer<typeof ProductSchema>;

export type MeiliSearchProduct = Meilisearch<Product>;