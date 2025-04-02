import { NextRequest, NextResponse } from "next/server";
import MeiliSearch from "meilisearch";
import dotenv from "dotenv";

import { ProductsRepository } from "@/repositories/products.repository";

dotenv.config();

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_APIKEY!,
});

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "";

    const limit = searchParams.get("limit") || "10";

    const page = searchParams.get("page") || "1";

    const results = await client.index("products").search(query, {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      filter: ["is_deleted = false"],
    })
    return NextResponse.json(results);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Hubo un error con la consulta GET', devError: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Hubo un error inesperado', devError: '' }, { status: 400 })
  }
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const products = await ProductsRepository.find(body);
    const count = await ProductsRepository.count(body);

    return NextResponse.json({ data: products, count });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
