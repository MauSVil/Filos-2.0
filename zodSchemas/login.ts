import z from "zod";

export const loginSchema = z.object({
  email: z.string({ message: "El correo es obligatorio" }).email("El correo no es válido"),
  password: z.string({ message: "La contraseña es obligatoria" }).min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export type LoginSchema = z.infer<typeof loginSchema>;