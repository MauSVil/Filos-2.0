import { z } from "zod";

import { OrderInputModel } from "@/types/RepositoryTypes/Order";

export const TempOrderInput = OrderInputModel.omit({
  created_at: true,
  updated_at: true,
  status: true,
  requestDate: true,
  totalAmount: true,
  finalAmount: true,
  paid: true,
}).extend({
  products: z
    .record(
      z.object({
        quantity: z.number(),
        product: z.string(),
      }),
    )
    .optional(),
});

export type TempOrder = z.infer<typeof TempOrderInput>;
