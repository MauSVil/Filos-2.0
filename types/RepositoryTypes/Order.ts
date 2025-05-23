import { z } from "zod";

const MongoOperatorSchema = z.record(z.any());

export const OrderRepositoryFilterModel = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  page: z.number().optional(),
  status: z.enum(["Pendiente", "Completado", "Cancelado"]).optional(),
  dateRange: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    })
    .optional(),
  dueDateRange: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    })
    .optional(),
  buyer: z.string().optional(),
  paid: z.boolean().optional(),
  orConditions: z.array(MongoOperatorSchema).optional(),
});

export type OrderRepositoryFilter = z.infer<typeof OrderRepositoryFilterModel>;

export const OrderModel = z.object({
  _id: z.string(),
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

export const OrderInputModel = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  buyer: z.string({ required_error: "El comprador es requerido" }),
  orderType: z.enum(
    ["retailPrice", "wholesalePrice", "specialPrice", "webPagePrice"],
    { required_error: "El tipo de orden es requerido" },
  ),
  requestDate: z.coerce.date({
    required_error: "La fecha de solicitud es requerida",
    invalid_type_error: "La fecha de solicitud es invalida",
  }),
  dueDate: z.coerce.date({
    required_error: "La fecha de entrega es requerida",
    invalid_type_error: "La fecha de entrega es invalida",
  }),
  freightPrice: z.coerce
    .number({ required_error: "El precio de flete es requerido" })
    .nonnegative({ message: "El precio de flete debe ser mayor o igual a 0" })
    .optional()
    .default(0),
  advancedPayment: z.coerce
    .number({ required_error: "El anticipo es requerido" })
    .optional()
    .default(0),
  description: z
    .string({ required_error: "La descripcion es requerida" })
    .optional()
    .default(""),
  products: z.array(
    z.object({
      product: z.string(),
      quantity: z.coerce.number({ required_error: "La cantidad es requerida" }),
      total: z.coerce.number({ required_error: "El total es requerido" }),
    }),
  ),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable().optional(),
  status: z.enum(["Pendiente", "Completado", "Cancelado"]),
  totalAmount: z.coerce.number({ required_error: "El total es requerido" }),
  finalAmount: z.coerce.number({
    required_error: "El total final es requerido",
  }),
  paid: z.boolean({ required_error: "El pago es requerido" }),
  documents: z
    .object({
      order: z.string().optional(),
    })
    .optional(),
});

export const OrderUpdateInputModel = OrderInputModel.partial();
export type OrderUpdateInput = z.infer<typeof OrderUpdateInputModel>;

export type OrderInput = z.infer<typeof OrderInputModel>;
