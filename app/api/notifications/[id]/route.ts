import { NotificationsRepository } from "@/repositories/notifications.repository";
import { NextResponse } from "next/server";

export const PUT = async (req: Request, { params }: { params: { id: string }}) => {
  try {
    const body = await req.json();
    const { id } = params;
    await NotificationsRepository.updateOne(id, body);
    return NextResponse.json({ message: 'Notification updated' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}