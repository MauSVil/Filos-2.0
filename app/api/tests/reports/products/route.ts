import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";
import moment from "moment";
import ExcelJS from "exceljs";

import { ProductsRepository } from "@/repositories/products.repository";
import { OrdersRepository } from "@/repositories/orders.repository";

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

    const productIds = orders.flatMap((order) =>
      order.products.map((product) => product.product.toString()),
    );
    const products = await ProductsRepository.find({ ids: productIds });
    const productsById = _.keyBy(products, "_id");

    const productsByYear = orders.reduce(
      (acc, order) => {
        const { requestDate } = order;

        const year = moment(requestDate).year();

        if (!acc[year]) {
          acc[year] = {};
        }

        order.products.forEach((product) => {
          const productId = product.product.toString();
          const name = productsById[productId].uniqId;
          const quantity = product.quantity;

          if (!acc[year][name]) {
            acc[year][name] = 0;
          }

          acc[year][name] += quantity;
        });

        return acc;
      },
      {} as Record<string, Record<string, number>>,
    );

    const workbook = new ExcelJS.Workbook();

    for (const year in productsByYear) {
      const sheet = workbook.addWorksheet(year);

      sheet.columns = [
        { header: "Producto", key: "name", width: 20 },
        { header: "Cantidad", key: "quantity", width: 10 },
      ];

      for (const name in productsByYear[year]) {
        sheet.addRow({ name, quantity: productsByYear[year][name] });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="reporte-productos.xlsx"',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
};
