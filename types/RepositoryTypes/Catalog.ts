import { z } from "zod";

export const CatalogRepositoryFilterModel = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

export type CatalogRepositoryFilter = z.infer<
  typeof CatalogRepositoryFilterModel
>;

export const CatalogInputModel = z.object({
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  pdf: z.string(),
});

export type CatalogInput = z.infer<typeof CatalogInputModel>;
