import { z } from "zod";
import { ProductModel } from "./Product";

export const ProductClient = ProductModel.and(z.object({
  image: z.instanceof(File).or(z.string()).optional(),
}))

export type ProductClient = z.infer<typeof ProductClient>;
