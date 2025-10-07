import { handleError } from "@/lib/handleError";
import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { BuyerInput } from "@/types/v2/Buyer/Base.type";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid buyer ID" },
        { status: 400 }
      );
    }

    const buyer = await BuyerRepository.findOne({ _id: new ObjectId(id) });

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    // Convert ObjectId to string for client
    const buyerResponse = {
      ...buyer,
      _id: buyer._id.toString(),
    };

    return NextResponse.json(buyerResponse);
  } catch (error) {
    return handleError(error);
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid buyer ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const data = BuyerInput.parse(
      JSON.parse(formData.get("data")?.toString() || "{}")
    );

    const buyer = await BuyerRepository.findOne({ _id: new ObjectId(id) });

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    await BuyerRepository.updateOne(id, data);

    return NextResponse.json(
      { message: "Buyer updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
};
