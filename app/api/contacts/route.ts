import { NextRequest, NextResponse } from "next/server";

import { ContactsRepository } from "@/repositories/contacts.repository";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const filter = {
      ...(limit && { limit: parseInt(limit, 10) }),
      ...(offset && { offset: parseInt(offset, 10) }),
    };

    const contacts = await ContactsRepository.find(filter);

    return NextResponse.json({ data: contacts });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
};
