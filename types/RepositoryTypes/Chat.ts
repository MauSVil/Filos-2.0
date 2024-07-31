import { z } from "zod";

export const ChatRepositoryFilterModel = z.object({
  id: z.string().optional(),
});

export type ChatRepositoryFilter = z.infer<typeof ChatRepositoryFilterModel>;