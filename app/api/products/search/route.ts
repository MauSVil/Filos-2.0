import { ProductsRepository } from "@/repositories/products.repository"
import { NextResponse } from "next/server"
import MeiliSearch from "meilisearch";
import dotenv from 'dotenv';

dotenv.config();

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_APIKEY!,
})

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const index = client.index('products');
    await index.updateSearchableAttributes(['baseId', 'uniqId', 'name'])
    const products = await index.search(query, { matchingStrategy: 'all' });
    return NextResponse.json({ data: products });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const products = await ProductsRepository.find(body);
    const count = await ProductsRepository.count(body);
    return NextResponse.json({ data: products, count });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}