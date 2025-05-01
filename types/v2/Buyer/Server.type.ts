import { z } from "zod";
import { ObjectId } from "mongodb";
import { BuyerBase } from "./Base.type";

export const BuyerServer = BuyerBase.extend({
  _id: z.instanceof(ObjectId),
});

export type BuyerServerType = z.infer<typeof BuyerServer>;