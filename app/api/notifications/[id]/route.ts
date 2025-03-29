import { NextRequest, NextResponse } from "next/server";

import { NotificationsRepository } from "@/repositories/notifications.repository";

export const PUT = async (
  req: NextRequest,
) => {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')
  try {
    if (!id) throw new Error("Notification ID is required");
    const body = await req.json();

    await NotificationsRepository.updateOne(id, body);

    return NextResponse.json({ message: "Notification updated" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
