import { z } from "zod";
import { OrderBase } from "./Base.type";

export const OrderClient = OrderBase.extend({
  _id: z.string(),
});

export type OrderClientType = z.infer<typeof OrderClient>;