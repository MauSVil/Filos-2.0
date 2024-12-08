import { ContactsRepository } from "@/repositories/contacts.repository"
import { NextResponse } from "next/server"

export const GET = async () => {
  try {
    const contacts = await ContactsRepository.find();
    return NextResponse.json({ data: contacts })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 400 })
  }
}