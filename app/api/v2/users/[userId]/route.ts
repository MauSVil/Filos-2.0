import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
    request: NextRequest,
    { params }: { params: { userId: string } }
  ) => {
  try {
    const { userId } = params;
    const body = await request.json();

    return NextResponse.json({ message: `Usuario ${userId} actualizado correctamente` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}