import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";

import { ProductsRepository } from "@/repositories/products.repository";

const limit = pLimit(10);

export const POST = async (req: NextRequest) => {
  try {
    const values = await req.json();
    const { retailPrice, specialPrice, webPagePrice, wholesalePrice } = values;

    if (!retailPrice || !specialPrice || !webPagePrice || !wholesalePrice) {
      throw new Error("Missing fields");
    }
    const productFound = await ProductsRepository.findOne({
      uniqId: values.uniqId,
    });
    const baseId = productFound?.baseId;

    if (!baseId) {
      throw new Error("Product not found");
    }

    const products = await ProductsRepository.find({ baseId });

    const promises = products.map((product) => {
      return limit(async () => {
        const _id = product._id.toString();

        await ProductsRepository.updateOne({
          _id,
          retailPrice,
          specialPrice,
          webPagePrice,
          wholesalePrice,
          quantity: product.quantity,
        });
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ data: values });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
