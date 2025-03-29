import { NextResponse } from "next/server";

import { BuyersRepository } from "@/repositories/buyers.repository";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const buyers = await BuyersRepository.find(body);

    return NextResponse.json(buyers);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
