import { ProductsRepository } from "@/repositories/products.repository"
import { NextResponse } from "next/server"
import MeiliSearch from "meilisearch";

export const GET = async (req: Request) => {
  try {
    const client = new MeiliSearch({
      host: 'http://meilisearch-kk08448.5.161.110.192.sslip.io/',
      apiKey: 'dPjUkBDZT5tIK2OgL5zGVszPvVpz7AVA'
    })

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
    return NextResponse.json({ data: products });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}