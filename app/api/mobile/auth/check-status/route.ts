import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UsersRepository } from "@/repositories/users.repository";

interface UserTokenBody {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const GET = async (req: NextRequest) => {
  try {
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(authorizationHeader, 'secretWord') as UserTokenBody;

    const userFound = await UsersRepository.findOne({ id: decoded.id });
    if (!userFound) throw new Error("Usuario no encontrado");

    const myUser = {
      id: userFound._id,
      email: userFound.email,
      name: userFound.name,
      role: userFound.role,
    }

    const newToken = jwt.sign(myUser, 'secretWord', { expiresIn: '7d' });

    return NextResponse.json({
      id: userFound._id,
      email: userFound.email,
      name: userFound.name,
      firstLastName: userFound.firstLastName,
      secondLastName: userFound.secondLastName,
      role: userFound.role,
      token: newToken,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}