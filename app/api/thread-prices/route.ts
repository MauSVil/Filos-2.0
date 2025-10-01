import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ThreadPriceRepository } from "@/repositories/threadprice.repository";
import {
  ThreadPriceInput,
  ThreadPriceInputModel,
} from "@/types/RepositoryTypes/ThreadPrice";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter: any = {};

    if (year) {
      filter.year = parseInt(year);
    }

    if (startDate) {
      filter.startDate = new Date(startDate);
    }

    if (endDate) {
      filter.endDate = new Date(endDate);
    }

    const threadPrices = await ThreadPriceRepository.find(filter);

    return NextResponse.json(threadPrices);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          devError: error.message,
          error: "[Get Thread Prices] No se pudieron obtener los precios",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const data: ThreadPriceInput = await ThreadPriceInputModel.parseAsync(body);

    const threadPrice = await ThreadPriceRepository.create(data);

    return NextResponse.json(threadPrice, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }

    if (e instanceof Error) {
      return NextResponse.json(
        {
          devError: e.message,
          error: "[Create Thread Price] No se pudo crear el precio",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
