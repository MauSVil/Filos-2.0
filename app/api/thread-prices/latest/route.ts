import { NextResponse } from "next/server";

import { ThreadPriceRepository } from "@/repositories/threadprice.repository";

export const GET = async () => {
  try {
    const latestPrice = await ThreadPriceRepository.getLatest();

    if (!latestPrice) {
      return NextResponse.json(
        { error: "No thread prices found" },
        { status: 404 },
      );
    }

    return NextResponse.json(latestPrice);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          devError: error.message,
          error: "[Get Latest Thread Price] No se pudo obtener el precio más reciente",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
