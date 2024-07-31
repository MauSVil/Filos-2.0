import { MessagesRepository } from "@/repositories/messages.repository";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const messages = await MessagesRepository.findOne(body);
    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Messages not found" }, { status: 404 });
  }
}