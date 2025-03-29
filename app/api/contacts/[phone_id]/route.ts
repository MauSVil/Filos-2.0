import { NextRequest, NextResponse } from "next/server";

import { ContactsRepository } from "@/repositories/contacts.repository";

export const GET = async (
  request: NextRequest,
) => {
  const searchParams = request.nextUrl.searchParams
  const phone_id = searchParams.get('phone_id')

  try {
    if (!phone_id) {
      throw new Error("Phone ID is required");
    }
    const contact = await ContactsRepository.findOne({ phone_id });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
};
