import { NextResponse } from "next/server";

import { HistoryMovementsRepository } from "@/repositories/historymovements.repository";

export const GET = async () => {
  try {
    const movementsHistory = await HistoryMovementsRepository.find();

    return NextResponse.json({ data: movementsHistory });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
