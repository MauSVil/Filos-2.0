import { z } from "zod";

export const OrderRepositoryFilterModel = z.object({
  id: z.string().optional(),
  page: z.number().optional(),
  status: z.enum(['Pendiente', 'Completado', 'Cancelado']).optional(),
});

export type OrderRepositoryFilter = z.infer<typeof OrderRepositoryFilterModel>;

export const OrderInputModel = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).min(3, 'El nombre debe tener al menos 3 caracteres'),
  buyer: z.string({ required_error: 'El comprador es requerido' }),
  orderType: z.string({ required_error: 'El tipo de orden es requerido' }),
  dueDate: z.coerce.date({ required_error: 'La fecha de entrega es requerida', invalid_type_error: 'La fecha de entrega es invalida' }),
  freightPrice: z.coerce.number({ required_error: 'El precio de flete es requerido' }).optional(),
  advancedPayment: z.coerce.number({ required_error: 'El anticipo es requerido' }).optional(),
  description: z.string({ required_error: 'La descripcion es requerida' }).optional(),
  products: z.record(z.object({
    quantity: z.coerce.number({ required_error: 'La cantidad es requerida' }),
    image: z.string()
  })).optional(),
});

export type OrderInput = z.infer<typeof OrderInputModel>;

