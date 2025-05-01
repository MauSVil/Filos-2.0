import { z } from "zod";
import { ObjectId } from "mongodb";
import { OrderBase } from "./Base.type";

export const OrderServer = OrderBase.extend({
  _id: z.instanceof(ObjectId),
});

export type OrderServerType = z.infer<typeof OrderServer>;