import { BuyersRepository } from "@/repositories/buyers.repository"
import { BuyerInputModel } from "@/types/RepositoryTypes/Buyer"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData()
    const data = BuyerInputModel.parse(JSON.parse(formData.get('data')?.toString() || '{}'))
    await BuyersRepository.insertOne(data)
    return NextResponse.json({ message: 'Buyer inserted' }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}