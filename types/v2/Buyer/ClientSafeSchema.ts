import { z } from "zod";

export const BuyerInputSchema = z.object({
  name: z.string().nonempty("El nombre es obligatorio"),
  email: z.string().email("Debe ser un correo válido").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isChain: z.boolean(),
});

export type BuyerInputType = z.infer<typeof BuyerInputSchema>;
