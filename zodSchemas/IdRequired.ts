import { z } from "zod";

export const IdRequired = z
  .string()
  .or(z.number())
  .pipe(z.coerce.number().int());

export type IdRequired = z.input<typeof IdRequired>;
