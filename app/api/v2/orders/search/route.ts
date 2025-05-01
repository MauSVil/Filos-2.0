import { handleError } from "@/lib/handleError";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { NextRequest, NextResponse } from "next/server";
import MeiliSearch from "meilisearch";
import { OrderServer } from "@/types/v2/Order/Server.type";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_APIKEY!,
});

export const POST = async (req: NextRequest) => {
  try {
    const prebody = await req.json();
    const body = await OrderServer.partial().parseAsync(prebody)
    const orders = await OrderRepository.find(body);
    return NextResponse.json({ orders });
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
    const filters = searchParams.get("filters") || "";

    const results = await client.index("orders").search(query, {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      filter: filters ? filters.split(",") : [],
      sort: ["requestDate:desc"],
    })
    return NextResponse.json(results);

  } catch (error) {
    handleError(error);
  }
};