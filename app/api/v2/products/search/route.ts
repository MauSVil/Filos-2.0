import { handleError } from "@/lib/handleError";
import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_APIKEY!,
});

export const POST = async (req: NextRequest) => {
  try {
    const { _id, ...rest } = await req.json();

    const filters: any = {
      ...rest,
    };

    if (_id?.$in) {
      filters._id = { $in: _id.$in.map((id: string) => new ObjectId(id)) };
    }

    console.log({ filters });

    const products = await ProductRepository.find(filters);
    return NextResponse.json(products);
  } catch (error) {
    return handleError(error); 
  }
}

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