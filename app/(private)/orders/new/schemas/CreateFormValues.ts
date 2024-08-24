import { z } from 'zod';

export const CreateFormValues = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).min(3, 'El nombre debe tener al menos 3 caracteres'),
  buyer: z.string({ required_error: 'El comprador es requerido' })
});

export type CreateFormValues = z.input<typeof CreateFormValues>;
