import { ContactRepository } from "@/repositories/contacts.repository";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const contacts = await ContactRepository.find(body);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Contacts not found" }, { status: 404 });
  }
}