import { z } from "zod";

export const BuyerRepositoryFilterModel = z.object({
  id: z.string().optional(),
  page: z.number().optional(),
  buyers: z.array(z.string()).optional(),
});

export type BuyerRepositoryFilter = z.infer<typeof BuyerRepositoryFilterModel>;

export const BuyerInputModel = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type BuyerInput = z.infer<typeof BuyerInputModel>;

