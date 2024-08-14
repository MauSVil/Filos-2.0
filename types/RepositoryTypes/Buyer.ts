import { z } from "zod";

export const BuyerRepositoryFilterModel = z.object({
  id: z.string().optional(),
  page: z.number().optional(),
});

export type BuyerRepositoryFilter = z.infer<typeof BuyerRepositoryFilterModel>;

export const BuyerInputModel = z.object({
});

export type BuyerInput = z.infer<typeof BuyerInputModel>;

