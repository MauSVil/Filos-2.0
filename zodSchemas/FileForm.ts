import z from "zod";

export const fileFormSchema = z.object({
  awsFile: z.string().optional(),
  file: z.string().optional(),
  fileFile: z.unknown().optional(),
  catalogueFile: z.string().optional(),
});

export type FileFormSchema = z.infer<typeof fileFormSchema>;
