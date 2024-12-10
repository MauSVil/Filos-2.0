import { z } from "zod";

export const ContactRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type ContactRepositoryFilter = z.infer<typeof ContactRepositoryFilterModel>;

export const ContactInputModel = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  version: z.number().optional(),
});

export type ContactInput = z.infer<typeof ContactInputModel>;

