import { z } from "zod";
import { ProductInputModel } from "./Product";

const isClient = typeof window !== "undefined";

export const ProductInputClient = ProductInputModel.extend({
  image: isClient
    ? z.instanceof(File).or(z.string()).optional()
    : z.any().optional(),
});

export type ProductInputClient = z.infer<typeof ProductInputClient>;
