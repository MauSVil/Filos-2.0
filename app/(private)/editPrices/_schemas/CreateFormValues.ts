import { z } from "zod";

export const CreateFormValues = z.object({
  uniqId: z
    .string({ required_error: "La clave unica es requerida" })
    .min(3, { message: "La clave debe tener al menos 3 caracteres" }),
  specialPrice: z.coerce.number(),
  wholesalePrice: z.coerce.number(),
  retailPrice: z.coerce.number(),
  webPagePrice: z.coerce.number(),
});

export type CreateFormValues = z.input<typeof CreateFormValues>;
