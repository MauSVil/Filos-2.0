import { BuyersRepository } from "@/repositories/buyers.repository";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const buyers = await BuyersRepository.find(body);
    const count = await BuyersRepository.count(body);
    return NextResponse.json({ data: buyers, count });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}