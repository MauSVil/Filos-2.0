import { ObjectId } from "mongodb";
import { z } from "zod";

export const BuyerBase = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email().or(z.literal("")),
  phone: z.coerce.string(),
  address: z.string(),
  isChain: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});
export type BuyerBaseType = z.infer<typeof BuyerBase>;

export const BuyerBaseWithId = BuyerBase.extend({
  _id: z.instanceof(ObjectId),
});
export type BuyerBaseWithIdType = z.infer<typeof BuyerBaseWithId>;

export const BuyerInput = BuyerBase.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type BuyerInputType = z.infer<typeof BuyerInput>;

export const BuyerUpdate = BuyerBase.partial();
export type BuyerUpdateType = z.infer<typeof BuyerUpdate>;