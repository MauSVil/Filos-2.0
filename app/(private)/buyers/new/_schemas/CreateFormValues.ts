import { z } from 'zod';


export const CreateFormValues = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'El email no es válido' }).optional(),
  phone: z.string({ required_error: 'El teléfono es requerido' }).min(10, { message: 'El teléfono debe tener al menos 10 caracteres' }),
  address: z.string({ required_error: 'La dirección es requerida' }).min(3, { message: 'La dirección debe tener al menos 3 caracteres' }),
});;

export type CreateFormValues = z.input<typeof CreateFormValues>;
