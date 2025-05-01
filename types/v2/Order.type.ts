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

const OrderBaseModel = z.object({
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

export const OrderModel = OrderBaseModel.extend({
  _id: z.string(),
});
export type Order = z.infer<typeof OrderModel>;

export const CreateOrderInputModel = OrderBaseModel;
export type CreateOrderInput = z.infer<typeof CreateOrderInputModel>;

export const UpdateOrderInputModel = OrderBaseModel.partial();
export type UpdateOrderInput = z.infer<typeof UpdateOrderInputModel>;