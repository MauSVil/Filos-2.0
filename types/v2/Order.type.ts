import { ObjectId } from "mongodb";
import { z } from "zod";

export const OrderModel = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  requestDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  products: z.array(
    z.object({
      product: z.string(),
      quantity: z.coerce.number(),
      total: z.coerce.number(),
    }),
  ),
  buyer: z.string(),
  active: z.boolean(),
  status: z.enum(["Pendiente", "Completado", "Cancelado"]),
  orderType: z.enum([
    "retailPrice",
    "wholesalePrice",
    "specialPrice",
    "webPagePrice",
  ]),
  freightPrice: z.coerce.number(),
  advancedPayment: z.coerce.number(),
  description: z.string(),
  finalAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  documents: z.object({
    order: z.string().optional(),
  }),
  pdfStatus: z.string(),
  paid: z.boolean(),
});

export type Order = z.infer<typeof OrderModel>;