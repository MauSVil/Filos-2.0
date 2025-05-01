import { ObjectId } from "mongodb";
import { z } from "zod";

const ProductModel = z.object({
  product: z.string(),
  quantity: z.coerce.number(),
  total: z.coerce.number(),
});

const DocumentsModel = z.object({
  order: z.string().optional(),
});

export const OrderBase = z.object({
  _id: z.string(),
  name: z.string(),
  requestDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  products: z.array(ProductModel),
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
  documents: DocumentsModel.optional(),
  pdfStatus: z.string(),
  paid: z.boolean(),
});
export type OrderBaseType = z.infer<typeof OrderBase>;

export const OrderBaseWithId = OrderBase.extend({
  _id: z.instanceof(ObjectId),
});
export type OrderBaseWithIdType = z.infer<typeof OrderBaseWithId>;

export const OrderInput = OrderBase.omit({
  _id: true,
});
export type OrderInputType = z.infer<typeof OrderInput>;

export const OrderUpdate = OrderBase.omit({ _id: true }).partial();
export type OrderUpdateType = z.infer<typeof OrderUpdate>;