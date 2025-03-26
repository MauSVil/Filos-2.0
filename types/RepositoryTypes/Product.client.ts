import { z } from "zod";
import { ProductInputModel } from "./Product";

export const ProductInputClient = ProductInputModel.extend({
  image: z.instanceof(File).or(z.string()).optional(),
});

export type ProductInputClient = z.infer<typeof ProductInputClient>;
