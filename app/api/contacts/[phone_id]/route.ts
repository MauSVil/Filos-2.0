import { ContactsRepository } from "@/repositories/contacts.repository";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { phone_id: string } }) => {
  try {
    const { phone_id } = params;
    if (!phone_id) {
      throw new Error('Phone ID is required');
    }
    const contact = await ContactsRepository.findOne({ phone_id });
    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 400 });
  }
}