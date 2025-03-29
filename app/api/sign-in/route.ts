import { UsersRepository } from "@/repositories/users.repository";
import ky from "ky";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type Body = z.infer<typeof Body>;

export const POST = async (req: NextRequest) => {
  let validatedBody: Body;

  try {
    validatedBody = Body.parse(await req.json());
  } catch (error) {
    return NextResponse.json(
      { message: "Error al iniciar sesion" },
      { status: 400 },
    );
  }

  try {
    console.log({ validatedBody });
    const userFound = await UsersRepository.findOne({ email: validatedBody.email });
    console.log({ userFound });

    // const json: { data: { token: string }; error: string } = await resp.json();

    // if (json.error) throw new Error(json.error);
    // (await cookies()).set("token", json?.data?.token, {
    //   maxAge: 60 * 60 * 24 * 7,
    // });

    return NextResponse.json({ message: "Se inicio sesion correctamente" });
  } catch (error) {
    console.log(error, "error");

    return NextResponse.json(
      { message: "Error al iniciar sesion" },
      { status: 400 },
    );
  }
};
