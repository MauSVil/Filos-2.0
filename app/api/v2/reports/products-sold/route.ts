import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { ProductRepository } from "@/repositories/v2/ProductRepository";
import _ from "lodash";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  try {
    if (!body.initDate || !body.endDate) throw new Error("No se tienen los parametros correctos");

    const orders = await OrderRepository.find({ requestDate: { $gte: new Date(body.initDate), $lte: new Date(body.endDate) } });

    let productsMap: { [key: string]: number } = {};

    for (const order of orders) {
      if (order.products.length === 0) continue;
      const orderProducts = order.products;

      for (const product of orderProducts) {
        if (!productsMap[product.product]) {
          productsMap[product.product] = 0;
        }
        productsMap[product.product] += product.quantity;
      }
    }

    const productsIds = Object.keys(productsMap);
    const products = await ProductRepository.find({ _id: { $in: productsIds.map(pi => new ObjectId(pi)) } });
    const productsMapped = _.keyBy(products, "_id");
    
    const output = Object.keys(productsMap).map((productId) => {
      const product = productsMapped[productId];

      return {
        product: product.uniqId,
        quantity: productsMap[productId],
        id: product._id,
      };
    });

    const finalOutput = _.keyBy(output, "id");

    return NextResponse.json(finalOutput);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}