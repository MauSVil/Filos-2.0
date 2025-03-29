import _ from "lodash";
import moment from "moment-timezone";
import { NextRequest, NextResponse } from "next/server";

import { OrdersRepository } from "@/repositories/orders.repository";
import { BuyersRepository } from "@/repositories/buyers.repository";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { buyerId } = body;

    const orders = await OrdersRepository.find({
      dateRange: {
        from: moment().tz("America/Mexico_City").startOf("year").toDate(),
        to: moment().tz("America/Mexico_City").endOf("year").toDate(),
      },
      ...(buyerId && { buyer: buyerId }),
    });

    if (!orders.length) {
      return NextResponse.json(
        { error: "No se encontraron ordenes" },
        { status: 404 },
      );
    }

    const ordersByBuyer = _.groupBy(orders, "buyer");
    const buyersIds = Object.keys(ordersByBuyer);

    const buyers = await BuyersRepository.find({ buyers: buyersIds });
    const buyersMapped = _.keyBy(buyers, "_id");

    const output: {
      [key: string]: { buyer: string; totalAmount: number; products: number };
    } = {};

    for (const buyer of Object.keys(ordersByBuyer)) {
      const orders = ordersByBuyer[buyer];
      const totalAmount = orders.reduce(
        (acc, order) => acc + (order.finalAmount || 0),
        0,
      );

      output[buyer] = {
        buyer: buyersMapped[buyer].name,
        totalAmount,
        products: orders.reduce((acc, order) => acc + order.products.length, 0),
      };
    }

    const orderByTotalAmount = _.orderBy(output, "totalAmount", "desc");

    return NextResponse.json(orderByTotalAmount);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
