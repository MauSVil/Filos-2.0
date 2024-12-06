import { UsersRepository } from "@/repositories/users.repository";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json());
    const { email, password } = body;

    const userFound = await UsersRepository.findOne({ email });
    if (!userFound) throw new Error("Usuario no encontrado");

    const isPasswordCorrect = await bcrypt.compare(password, userFound.password);
    if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");

    const myUser = {
      id: userFound._id,
      email: userFound.email,
      name: userFound.name,
      role: userFound.role,
    }

    const token = await jwt.sign(myUser, 'secretWord');

    return NextResponse.json({
      id: userFound._id,
      email: userFound.email,
      name: userFound.name,
      firstLastName: userFound.firstLastName,
      secondLastName: userFound.secondLastName,
      role: userFound.role,
      token
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error al iniciar sesion" }, { status: 400 });
  }
}