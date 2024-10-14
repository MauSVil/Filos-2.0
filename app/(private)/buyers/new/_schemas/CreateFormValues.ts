import { z } from 'zod';

export const CreateFormValues = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().email({ message: 'El email no es válido' }).optional()
  ),
  phone: z.string({ required_error: 'El teléfono es requerido' }).min(10, { message: 'El teléfono debe tener al menos 10 caracteres' }),
  address: z.string({ required_error: 'La dirección es requerida' }).optional(),
  isChain: z.boolean().default(false),
});;

export type CreateFormValues = z.input<typeof CreateFormValues>;
