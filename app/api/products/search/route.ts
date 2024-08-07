import { ProductsRepository } from "@/repositories/products.repository"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const products = await ProductsRepository.find(body);
    return NextResponse.json({ data: products });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}