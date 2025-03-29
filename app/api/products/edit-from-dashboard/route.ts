import { NextRequest, NextResponse } from "next/server";

import { ProductsRepository } from "@/repositories/products.repository";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { products } = body;

    const productsIds = Object.keys(products);

    for (const productId of productsIds) {
      const quantity = products[productId].quantity;

      if (quantity === 0) continue;
      const product = await ProductsRepository.findOne({ id: productId });
      const document = {
        _id: productId,
        quantity: Number(product?.quantity + quantity),
      };

      await ProductsRepository.updateOne(document);
    }

    return NextResponse.json({ message: "Productos actualizados" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
