import { ProductsRepository } from "@/repositories/products.repository"
import { Product } from "@/types/MongoTypes/Product"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  const body = await req.json()
  console.log(body)
  return NextResponse.json({ message: 'Hello World' })
}

export const PUT = async (req: Request) => {
  try {
    const body = await req.json() as Partial<Product>
    if (!body._id) throw new Error('No se encontro el producto')
    await ProductsRepository.updateOne(body);
    return NextResponse.json({ message: 'Product updated' })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}