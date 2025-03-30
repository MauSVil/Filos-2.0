import { z } from "zod";

export const ContactRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type ContactRepositoryFilter = z.infer<
  typeof ContactRepositoryFilterModel
>;

export const ContactModel = z.object({
  _id: z.string(),
  aiEnabled: z.boolean(),
  lastMessageSent: z.coerce.date(),
  fullName: z.string(),
  phone_id: z.string(),
});

export type Contact = z.infer<typeof ContactModel>;

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
