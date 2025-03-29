import { NextRequest, NextResponse } from "next/server";

import { CatalogsRepository } from "@/repositories/catalogs.repository";

export const GET = async (req: NextRequest) => {
  try {
    const catalogs = await CatalogsRepository.find({});

    return NextResponse.json(catalogs);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id } = body;

    const catalog = await CatalogsRepository.findOne({ id });

    if (!catalog) {
      return NextResponse.json(
        { error: "No se encontro el catalogo" },
        { status: 404 },
      );
    }

    return NextResponse.json(catalog);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
