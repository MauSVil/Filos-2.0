import { handleError } from "@/lib/handleError";
import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export const POST = async (req: Request) => {
  try {
    const { _id, ...rest } = await req.json();

    const filters: any = {
      ...rest,
    };

    if (_id?.$in) {
      filters._id = { $in: _id.$in.map((id: string) => new ObjectId(id)) };
    }

    const products = await ProductRepository.find(filters);
    return NextResponse.json(products);
  } catch (error) {
    return handleError(error); 
  }
}