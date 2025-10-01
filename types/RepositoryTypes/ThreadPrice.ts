import { z } from "zod";

export const ThreadPriceModel = z.object({
  _id: z.string(),
  pricePerKg: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional(),
});

export type ThreadPrice = z.infer<typeof ThreadPriceModel>;

export const ThreadPriceInputModel = z.object({
  _id: z.string().optional(),
  pricePerKg: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type ThreadPriceInput = z.infer<typeof ThreadPriceInputModel>;

export const ThreadPriceRepositoryFilterModel = z.object({
  id: z.string().optional(),
  year: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type ThreadPriceRepositoryFilter = z.infer<
  typeof ThreadPriceRepositoryFilterModel
>;
