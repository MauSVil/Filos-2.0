import { ObjectId } from "mongodb";
import { z } from "zod";

export const BuyerRepositoryFilterModel = z.object({
  id: z.string().optional(),
  page: z.number().optional(),
  buyers: z.array(z.string()).optional(),
  phone: z.string().optional(),
  isChain: z.boolean().optional(),
});

export type BuyerRepositoryFilter = z.infer<typeof BuyerRepositoryFilterModel>;

export const BuyerModel = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  email: z.string().email(),
  isChain: z.boolean(),
});

export type Buyer = z.infer<typeof BuyerModel>;

export const BuyerInputModel = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string(),
  address: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  version: z.number().optional(),
  isChain: z.boolean().default(false),
});

export type BuyerInput = z.infer<typeof BuyerInputModel>;
