import { NextResponse } from "next/server";
import moment from "moment-timezone";

import { OrdersRepository } from "@/repositories/orders.repository";
import { Order } from "@/types/MongoTypes/Order";

interface GroupedOrders {
  [year: number]: {
    [month: string]: number;
  };
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const groupOrdersByYearAndMonth = (orders: Order[]): GroupedOrders => {
  const grouped: GroupedOrders = orders.reduce<GroupedOrders>((acc, order) => {
    const year = moment(order.requestDate).tz("America/Mexico_City").year();
    const month = moment(order.requestDate)
      .tz("America/Mexico_City")
      .format("MMMM");

    if (!acc[year]) acc[year] = {};

    if (!acc[year][month]) acc[year][month] = 0;

    acc[year][month] += order.totalAmount + order.freightPrice;

    return acc;
  }, {});

  for (const year of Object.keys(grouped)) {
    for (const month of MONTHS) {
      if (!grouped[parseInt(year)][month]) {
        grouped[parseInt(year)][month] = 0;
      }
    }
  }

  return grouped;
};

export const GET = async () => {
  try {
    const from = moment()
      .tz("America/Mexico_City")
      .subtract(1, "year")
      .startOf("year")
      .toDate();
    const to = moment().tz("America/Mexico_City").endOf("year").toDate();

    const orders = await OrdersRepository.find({
      dateRange: { from, to },
      paid: true,
      status: "Completado",
    });
    const groupedOrders: GroupedOrders = groupOrdersByYearAndMonth(orders);

    return NextResponse.json({ data: groupedOrders });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
