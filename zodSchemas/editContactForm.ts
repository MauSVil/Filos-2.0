import { z } from "zod";

export const editContactFormSchema = z.object({
  fullName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  type: z.enum(['retail', 'wholesale']).nullable().optional(),
  phone_id: z.string().optional(),
});

export type EditContactFormSchema = z.infer<typeof editContactFormSchema>;