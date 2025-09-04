import { UsersRepository } from "@/repositories/users.repository";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

type Body = z.infer<typeof Body>;

export const POST = async (req: NextRequest) => {
  try {
    const validatedBody = Body.parse(await req.json());
    const userFound = await UsersRepository.findOne({ email: validatedBody.email });

    if (!userFound) throw new Error("Usuario no encontrado");

    const isValid = await bcrypt.compare(validatedBody.password, userFound.password);
    if (!isValid) throw new Error("Contraseña incorrecta");

    const myUser = {
      id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
    }

    const token = await jwt.sign(myUser, 'secretWord');

    (await cookies()).set("token", token, {
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: "Se inicio sesion correctamente", token });
  } catch (error) {
    console.log(error, "error");

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Error al iniciar sesion" },
      { status: 400 },
    );
  }
};
