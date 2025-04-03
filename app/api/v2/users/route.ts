import { handleError } from "@/lib/handleError";
import { UserRepository } from "@/repositories/v2/UserRepository";
import { MongoUserModel } from "@/types/RepositoryTypes/User";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const prevBody = await req.json();
    const body = await MongoUserModel.parseAsync(prevBody);

    await UserRepository.insertOne(body);

    return NextResponse.json("Usuario creado correctamente", { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}