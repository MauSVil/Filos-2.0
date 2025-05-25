import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import _ from "lodash";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { initDate, endDate } = body;

    const orders = await OrderRepository.find({ status: 'Completado', paid: true });
    const buyers = _.uniq(orders.map(order => order.buyer));

    const buyersFound = await BuyerRepository.find({ _id: { $in: buyers.map(buyer => new ObjectId(buyer)) } });

    const data = orders.reduce((acc, order) => {
      const buyer = buyersFound.find(b => b._id.toString() === order.buyer);
      if (!buyer) return acc;
      acc[buyer.name] = {
        orders: (acc[buyer.name]?.orders || 0) + 1,
        products: Number.isInteger(acc[buyer.name]?.products) ? acc[buyer.name].products + order.products.length : order.products.length,
      }
      return acc;
    }, {} as Record<string, { orders: number, products: number }>);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(error.message, { status: 400 });
    }
    return NextResponse.json("An unexpected error occurred", { status: 500 });
  }
}