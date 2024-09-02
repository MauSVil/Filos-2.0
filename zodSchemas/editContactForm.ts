import { z } from "zod";

export const editContactFormSchema = z.object({
  fullName: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['retail', 'wholesale']).optional(),
  phone_id: z.string().optional(),
});

export type EditContactFormSchema = z.infer<typeof editContactFormSchema>;