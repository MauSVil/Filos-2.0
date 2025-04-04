import { NextResponse } from "next/server";

import { OrdersRepository } from "@/repositories/orders.repository";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const orders = await OrdersRepository.find(body);
    const count = await OrdersRepository.count(body);

    return NextResponse.json({ data: orders, count });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
