import { ContactRepository } from "@/repositories/v2/ContacRepository";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    await ContactRepository.updateOne({ _id: id }, body);

    return NextResponse.json({ message: `Contacto ${id} actualizado correctamente` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}