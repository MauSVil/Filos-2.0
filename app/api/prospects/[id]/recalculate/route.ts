import { NextRequest, NextResponse } from "next/server";

import { ProspectRepository } from "@/repositories/prospect.repository";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const prospect = await ProspectRepository.recalculateById(id);

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
          error: "[Recalculate Prospect] No se pudieron recalcular los costos",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
