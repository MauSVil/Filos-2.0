import { z } from "zod";

export const BuyerInputSchema = z.object({
  name: z.string().nonempty("El nombre es obligatorio"),
  email: z.string().email("Debe ser un correo válido").or(z.literal("")),
  phone: z.coerce.string().optional().default(""),
  address: z.string().optional().default(""),
  isChain: z.boolean().optional().default(false),
});

export type BuyerInputType = z.infer<typeof BuyerInputSchema>;
