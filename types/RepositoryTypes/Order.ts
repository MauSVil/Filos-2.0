import { z } from "zod";

export const OrderRepositoryFilterModel = z.object({
  id: z.string().optional(),
  page: z.number().optional(),
  status: z.enum(['Pendiente', 'Completado', 'Cancelado']).optional(),
});

export type OrderRepositoryFilter = z.infer<typeof OrderRepositoryFilterModel>;

export const OrderInputModel = z.object({
});

export type OrderInput = z.infer<typeof OrderInputModel>;

