import { OrdersRepository } from "@/repositories/orders.repository";
import { ProductsRepository } from "@/repositories/products.repository";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment-timezone";

export const GET = async (req: NextRequest) => {
  try {
    const orders = await OrdersRepository.find({ dateRange: { from: moment('2024-01-01').tz('America/Mexico_City').toDate(), to: moment('2024-12-31').tz('America/Mexico_City').toDate() } });
    if (!orders.length) {
      return NextResponse.json({ error: 'No se encontraron ordenes' }, { status: 404 });
    }

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
    const products = await ProductsRepository.find({ ids: productsIds });
    const productsMapped = _.keyBy(products, '_id');

    const output = Object.keys(productsMap).map((productId) => {
      const product = productsMapped[productId];
      return {
        product: product.uniqId,
        quantity: productsMap[productId],
        id: product._id,
      };
    });

    const finalOutput = _.keyBy(output, 'id');

    return NextResponse.json(finalOutput);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}