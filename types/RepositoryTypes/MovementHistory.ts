import { z } from "zod";

export const MovementHistoryModel = z.object({
  _id: z.string().optional(),
  createdAt: z.coerce.date().nullable().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
  deletedAt: z.coerce.date().nullable().optional(),
  values: z.record(z.any()),
  type: z.enum(["update", "insert"]),
  collection: z.enum(["products", "buyers", "orders", "catalogs"]),
});

export type MovementHistory = z.infer<typeof MovementHistoryModel>;
