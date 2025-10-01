import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ProspectRepository } from "@/repositories/prospect.repository";
import {
  ProspectInput,
  ProspectInputModel,
} from "@/types/RepositoryTypes/Prospect";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const name = searchParams.get("name");

    const filter: any = {};

    if (status && (status === "draft" || status === "active" || status === "archived")) {
      filter.status = status;
    }

    if (name) {
      filter.name = name;
    }

    const prospects = await ProspectRepository.find(filter);

    return NextResponse.json(prospects);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          devError: error.message,
          error: "[Get Prospects] No se pudieron obtener los prospectos",
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
    const data: ProspectInput = await ProspectInputModel.parseAsync(body);

    const prospect = await ProspectRepository.create(data);

    return NextResponse.json(prospect, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }

    if (e instanceof Error) {
      return NextResponse.json(
        {
          devError: e.message,
          error: "[Create Prospect] No se pudo crear el prospecto",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
