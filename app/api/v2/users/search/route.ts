import { handleError } from "@/lib/handleError";
import { UserRepository } from "@/repositories/v2/UserRepository";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const user = await UserRepository.find(body);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    handleError(error);
  }
}