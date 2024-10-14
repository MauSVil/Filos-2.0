import { BuyersRepository } from "@/repositories/buyers.repository";
import { OrdersRepository } from "@/repositories/orders.repository";
import _ from "lodash";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const orders = await OrdersRepository.find({ dateRange: { from: moment('01/01/2024').toDate(), to: moment('12/31/2024').toDate() } });
    if (!orders.length) {
      return NextResponse.json({ error: 'No se encontraron ordenes' }, { status: 404 });
    }

    const ordersByBuyer = _.groupBy(orders, 'buyer');
    const buyersIds = Object.keys(ordersByBuyer);

    const buyers = await BuyersRepository.find({ buyers: buyersIds });
    const buyersMapped = _.keyBy(buyers, '_id');

    const output: { [key: string]: { buyer: string, totalAmount: number, products: number } } = {};

    for (const buyer of Object.keys(ordersByBuyer)) {
      const orders = ordersByBuyer[buyer];
      const totalAmount = orders.reduce((acc, order) => acc + (order.finalAmount || 0), 0);
      output[buyer] = {
        buyer: buyersMapped[buyer].name,
        totalAmount,
        products: orders.reduce((acc, order) => acc + order.products.length, 0),
      };
    }

    return NextResponse.json(output);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}