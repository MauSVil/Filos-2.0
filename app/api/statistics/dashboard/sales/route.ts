import { OrdersRepository } from "@/repositories/orders.repository";
import { Order } from "@/types/MongoTypes/Order";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

interface GroupedOrders {
  [year: number]: {
    [month: string]: number;
  };
}
interface GroupedOrdersTemp {
  [year: number]: {
    [month: string]: Order[];
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const groupOrdersByYearAndMonth = (orders: Order[]): GroupedOrders => {
  const grouped: GroupedOrders = orders.reduce<GroupedOrders>((acc, order) => {
    const year = moment(order.requestDate).year();
    const month = moment(order.requestDate).format("MMMM");

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

const groupOrdersByYearAndMonthTemp = (orders: Order[]): GroupedOrdersTemp => {
  const grouped: GroupedOrdersTemp = orders.reduce<GroupedOrdersTemp>((acc, order) => {
    const year = moment(order.requestDate).year();
    const month = moment(order.requestDate).format("MMMM");

    if (!acc[year]) acc[year] = {};

    if (!acc[year][month]) acc[year][month] = [];

    acc[year][month].push(order);

    return acc;
  }, {});

  for (const year of Object.keys(grouped)) {
    for (const month of MONTHS) {
      if (!grouped[parseInt(year)][month]) {
        grouped[parseInt(year)][month] = [];
      }
    }
  }

  return grouped;
};

export const GET = async (req: NextRequest) => {
  try {
    const orders = await OrdersRepository.find({
      dateRange: { from: moment().utc().subtract(1, 'year').startOf('year').toDate(), to: moment().utc().endOf('year').toDate() },
      paid: true,
      status: 'Completado',
    });
    const groupedOrders: GroupedOrders = groupOrdersByYearAndMonth(orders);
    const groupedOrdersTemp: GroupedOrdersTemp = groupOrdersByYearAndMonthTemp(orders);

    return NextResponse.json({ data: groupedOrders, tempData: groupedOrdersTemp });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}