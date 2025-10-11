import { ContactRepository } from "@/repositories/v2/ContactRepository";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const contact = await ContactRepository.findOne({ _id: id });

    if (!contact) {
      return NextResponse.json({ message: "Contacto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

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