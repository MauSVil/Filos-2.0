import z from "zod";

export const fileFormSchema = z.object({
  awsFile: z.string().optional(),
  file: z.instanceof(File).optional(),
});

export type FileFormSchema = z.infer<typeof fileFormSchema>;