import { ObjectId } from "mongodb";
import { z } from "zod";

export const BuyerRepositoryFilterModel = z.object({
  _id: z.instanceof(ObjectId).optional(),
  page: z.number().optional(),
  buyers: z.array(z.string()).optional(),
  phone: z.string().optional(),
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
  version: z.number().optional(),
});

export type BuyerInput = z.infer<typeof BuyerInputModel>;

