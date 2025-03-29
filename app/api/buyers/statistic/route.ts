import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment-timezone";

import { ProductsRepository } from "@/repositories/products.repository";
import { OrdersRepository } from "@/repositories/orders.repository";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { buyerId, date } = body;

    if (!buyerId) {
      return NextResponse.json(
        { error: "No se pasaron los argumentos correctos" },
        { status: 404 },
      );
    }

    const year = moment(date).tz("America/Mexico_City").year();

    const orders = await OrdersRepository.find({
      buyer: buyerId,
      paid: true,
      dateRange: {
        from: moment(`${year}-01-01`).tz("America/Mexico_City").toDate(),
        to: moment(`${year}-12-31`).tz("America/Mexico_City").toDate(),
      },
    });

    const finalAmountPerMonth = orders.reduce(
      (acc, order) => {
        const month = order.requestDate.getMonth() + 1;

        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += order.finalAmount;

        return acc;
      },
      {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
      } as { [key: number]: number },
    );

    const productsPerMonth = orders.reduce(
      (acc, order) => {
        const month = order.requestDate.getMonth() + 1;

        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += order.products.length;

        return acc;
      },
      {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
      } as { [key: number]: number },
    );

    let mostPopularProducts: { [key: string]: number } = {};

    for (const order of orders) {
      for (const product of order.products) {
        if (!mostPopularProducts[product.product]) {
          mostPopularProducts[product.product] = 0;
        }
        mostPopularProducts[product.product] += product.quantity;
      }
    }
    const productsFound = await ProductsRepository.find({
      ids: Object.keys(mostPopularProducts),
    });
    const productsMapped = _.keyBy(productsFound, "_id");

    let mostPopularProductsModels: { [key: string]: number } = {};

    for (const productId in mostPopularProducts) {
      const product = productsMapped[productId];

      if (product) {
        mostPopularProductsModels[product.uniqId] =
          mostPopularProducts[productId];
      }
    }

    return NextResponse.json({
      finalAmountPerMonth,
      productsPerMonth,
      mostPopularProducts: mostPopularProductsModels,
      samples: orders.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
