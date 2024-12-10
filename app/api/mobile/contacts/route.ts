import { ContactsRepository } from "@/repositories/contacts.repository";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { page } = body;
    const contacts = await ContactsRepository.find({ limit: 10, offset: Number(page) * 10 });
    return NextResponse.json({ data: contacts });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}