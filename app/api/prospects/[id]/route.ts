import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ProspectRepository } from "@/repositories/prospect.repository";
import {
  ProspectInput,
  ProspectInputModel,
} from "@/types/RepositoryTypes/Prospect";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const prospect = await ProspectRepository.findOne({ id });

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(prospect);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          devError: error.message,
          error: "[Get Prospect] No se pudo obtener el prospecto",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Partial<ProspectInput> = await ProspectInputModel.partial().parseAsync(body);

    const prospect = await ProspectRepository.update(id, data);

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(prospect);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }

    if (e instanceof Error) {
      return NextResponse.json(
        {
          devError: e.message,
          error: "[Update Prospect] No se pudo actualizar el prospecto",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const deleted = await ProspectRepository.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          devError: error.message,
          error: "[Delete Prospect] No se pudo eliminar el prospecto",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
