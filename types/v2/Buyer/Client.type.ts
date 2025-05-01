import { z } from "zod";
import { BuyerBase } from "./Base.type";

export const BuyerClient = BuyerBase.extend({
  _id: z.string(),
});

export type BuyerClientType = z.infer<typeof BuyerClient>;