import moment from "moment";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import numeral from "numeral";

import { OrdersRepository } from "@/repositories/orders.repository";

interface Resp {
  orders: number;
  total: number;
  products: number;
  mayoreo: number;
  menudeo: number;
  especial: number;
  paginaWeb: number;
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      throw new Error("Invalid request body");
    }

    const orders = await OrdersRepository.find({
      dateRange: {
        from: moment(startDate, "DD/MM/YYYY").startOf("day").toDate(),
        to: moment(endDate, "DD/MM/YYYY").endOf("day").toDate(),
      },
      status: "Completado",
      paid: true,
    });

    const parsedOrders = orders.reduce(
      (acc, order) => {
        const { requestDate } = order;
        const year = moment(requestDate).year();
        const month = moment(requestDate).month() + 1;

        if (!acc[year]) {
          acc[year] = {};
        }

        if (!acc[year][month]) {
          acc[year][month] = {
            orders: 0,
            total: 0,
            products: 0,
            mayoreo: 0,
            menudeo: 0,
            especial: 0,
            paginaWeb: 0,
          };
        }

        const orderType = order.orderType;

        if (orderType === "wholesalePrice") {
          acc[year][month].mayoreo += 1;
        } else if (orderType === "retailPrice") {
          acc[year][month].menudeo += 1;
        } else if (orderType === "specialPrice") {
          acc[year][month].especial += 1;
        } else if (orderType === "webPagePrice") {
          acc[year][month].paginaWeb += 1;
        }

        acc[year][month] = {
          orders: acc[year][month].orders + 1,
          total: acc[year][month].total + order.totalAmount,
          products: acc[year][month].products + order.products.length,
          mayoreo: acc[year][month].mayoreo,
          menudeo: acc[year][month].menudeo,
          especial: acc[year][month].especial,
          paginaWeb: acc[year][month].paginaWeb,
        };

        return acc;
      },
      {} as Record<number, Record<number, Resp>>,
    );

    const workbook = new ExcelJS.Workbook();

    for (const year in parsedOrders) {
      const sheet = workbook.addWorksheet(year);

      sheet.columns = [
        { header: "Mes", key: "month" },
        { header: "Productos", key: "products" },
        { header: "Total", key: "total" },
        { header: "Ordenes", key: "orders" },
        { header: "Mayoreo", key: "mayoreo" },
        { header: "Semi-Mayoreo", key: "menudeo" },
        { header: "Especial", key: "especial" },
        { header: "Pagina Web", key: "paginaWeb" },
      ];

      for (const month in parsedOrders[year]) {
        sheet.addRow({
          month,
          orders: parsedOrders[year][month].orders,
          total: numeral(parsedOrders[year][month].total).format("$0,0.00"),
          products: parsedOrders[year][month].products,
          mayoreo: parsedOrders[year][month].mayoreo,
          menudeo: parsedOrders[year][month].menudeo,
          especial: parsedOrders[year][month].especial,
          paginaWeb: parsedOrders[year][month].paginaWeb,
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="reporte-ventas.xlsx"',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
