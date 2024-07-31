import { z } from "zod";

export const MessageRepositoryFilterModel = z.object({
  id: z.string().optional(),
  phone_id: z.string().optional(),
});

export type MessageRepositoryFilter = z.infer<typeof MessageRepositoryFilterModel>;