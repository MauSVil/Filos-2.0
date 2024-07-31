import { MessagesRepository } from "@/repositories/messages.repository";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const chats = await MessagesRepository.find(body);
    return NextResponse.json(chats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Chat not found" }, { status: 404 });
  }
}