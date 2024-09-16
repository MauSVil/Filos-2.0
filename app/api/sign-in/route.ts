import ky from "ky";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as Body;
    const resp = await ky.post("https://api-filos.mausvil.dev/auth/login", { json: body });
    const json: { data: { token: string }, error: string } = await resp.json();
    if (json.error) throw new Error(json.error);
    await cookies().set("token", json?.data?.token, { maxAge: 60 * 60 * 24 * 7 });

    return NextResponse.json({ message: "Se inicio sesion correctamente" });
  } catch (error) {
    console.log(error, 'error');
    return NextResponse.json({ message: "Error al iniciar sesion" }, { status: 400 });
  }
}