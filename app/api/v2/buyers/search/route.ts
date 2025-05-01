import { handleError } from "@/lib/handleError";
import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { _id, ...rest } = await req.json();

    const filters: any = {
      ...rest,
    };

    if (_id?.$in) {
      filters._id = { $in: _id.$in.map((id: string) => new ObjectId(id)) };
    }

    const buyers = await BuyerRepository.find(filters);
    return NextResponse.json(buyers);
  } catch (error) {
    return handleError(error);
  }
}