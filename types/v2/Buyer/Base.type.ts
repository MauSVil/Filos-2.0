import { z } from "zod";

export const BuyerBase = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  address: z.string(),
  isChain: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});
export type BuyerBaseType = z.infer<typeof BuyerBase>;

export const BuyerInput = BuyerBase;
export type BuyerInputType = z.infer<typeof BuyerInput>;

export const BuyerUpdate = BuyerBase.partial();
export type BuyerUpdateType = z.infer<typeof BuyerUpdate>;