import { z } from "zod";
import { Meilisearch } from "../Meilisearch";

export const ProductModel = z.object({
  _id: z.string(),
  baseId: z.string().regex(/^M-\d{4}$/, {
    message:
      "El formato debe ser 'M-3012', con una 'M', un guion y cuatro números.",
  }),
  uniqId: z
    .string({ message: "El campo uniqId es requerido" })
    .min(1, "El campo uniqId es requerido"),
  color: z
    .string({ message: "El campo color es requerido" })
    .min(1, "El campo color es requerido"),
  name: z
    .string({ message: "El campo name es requerido" })
    .min(1, "El campo name es requerido"),
  webPagePrice: z
    .number({ message: "El campo webPagePrice es requerido" })
    .min(1, "El campo webPagePrice es requerido"),
  wholesalePrice: z
    .number({ message: "El campo wholesalePrice es requerido" })
    .min(1, "El campo wholesalePrice es requerido"),
  retailPrice: z
    .number({ message: "El campo retailPrice es requerido" })
    .min(1, "El campo retailPrice es requerido"),
  specialPrice: z
    .number({ message: "El campo specialPrice es requerido" })
    .min(1, "El campo specialPrice es requerido"),
  quantity: z.number({ message: "El campo quantity es requerido" }),
  size: z
    .string({ message: "El campo size es requerido" })
    .min(1, "El campo size es requerido"),
  deleted_at: z.union([z.null(), z.coerce.date()]).optional(),
  image: z.string().optional(),
  minioImage: z.string().optional(),
  updated_at: z.coerce.date().optional(),
});

export type Product = z.infer<typeof ProductModel>;

export type MeiliSearchProduct = Meilisearch<Product>;

export const ProductRepositoryFilterModel = z.object({
  ids: z.array(z.string()).optional(),
  id: z.string().optional(),
  q: z.string().optional(),
  disponibility: z.string().optional(),
  page: z.number().optional(),
  uniqId: z.string().optional(),
  baseId: z.string().optional(),
});

export type ProductRepositoryFilter = z.infer<
  typeof ProductRepositoryFilterModel
>;

export const ProductInputModel = z.object({
  _id: z.string().optional(),
  name: z.string(),
  color: z.string(),
  size: z.string(),
  baseId: z.string(),
  uniqId: z.string(),
  quantity: z.number(),
  specialPrice: z.coerce.number(),
  wholesalePrice: z.coerce.number(),
  retailPrice: z.coerce.number(),
  webPagePrice: z.coerce.number(),
  sweaterWeight: z.coerce.number().optional(),
  sweaterWaste: z.coerce.number().optional(),
  image: z.string().optional(),
  minioImage: z.string().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.union([z.null(), z.coerce.date()]).optional(),
  created_at: z.coerce.date().optional(),
});

export type ProductInput = z.infer<typeof ProductInputModel>;
