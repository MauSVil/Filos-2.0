import { OrderInputModel } from '@/types/RepositoryTypes/Order';
import { z } from 'zod';

export const validateProductsStep = OrderInputModel.extend({
  products: z.record(z.object({
    quantity: z.coerce.number({ required_error: 'La cantidad es requerida' }),
    image: z.string()
  })),
});
