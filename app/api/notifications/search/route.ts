import { NextResponse } from "next/server";

import { NotificationsRepository } from "@/repositories/notifications.repository";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const notifications = await NotificationsRepository.find(body);

    return NextResponse.json(notifications);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
