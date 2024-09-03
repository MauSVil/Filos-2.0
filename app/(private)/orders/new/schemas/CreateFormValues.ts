import { z } from 'zod';

export const CreateFormValues = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).min(3, 'El nombre debe tener al menos 3 caracteres'),
  buyer: z.string({ required_error: 'El comprador es requerido' }),
  orderType: z.string({ required_error: 'El tipo de orden es requerido' }),
  freightPrice: z.coerce.number({ required_error: 'El precio de flete es requerido' }).optional(),
  advancedPayment: z.coerce.number({ required_error: 'El anticipo es requerido' }).optional(),
  description: z.string({ required_error: 'La descripcion es requerida' }).optional(),
});

export type CreateFormValues = z.input<typeof CreateFormValues>;
