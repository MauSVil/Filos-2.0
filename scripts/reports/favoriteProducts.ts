import fs from "fs";
import path from "path";

import moment from "moment";

import { OrdersRepository } from "@/repositories/orders.repository";
import { ProductsRepository } from "@/repositories/products.repository";

const init = async () => {
  const orders = await OrdersRepository.find({
    paid: true,
    status: "Completado",
    dateRange: {
      from: moment("2023-01-01").tz("America/Mexico_City").toDate(),
      to: moment("2023-12-31").tz("America/Mexico_City").toDate(),
    },
  });

  const productsObj: { [key: string]: number } = {};

  for (const order of orders) {
    for (const product of order.products) {
      if (!productsObj[product.product.toString()]) {
        productsObj[product.product.toString()] = 0;
      }

      productsObj[product.product.toString()] += product.quantity;
    }
  }

  const productsIds = Object.keys(productsObj);

  const productsFound = await ProductsRepository.find({ ids: productsIds });

  const productsModel = productsFound
    .map((product) => {
      return {
        model: product.uniqId,
        name: product.name,
        color: product.color,
        quantity: productsObj[product._id.toString()],
      };
    })
    .sort((a, b) => b.quantity - a.quantity);

  const filePath = path.join(__dirname, "favoriteProducts.json");

  fs.writeFileSync(filePath, JSON.stringify(productsModel, null, 2));

  process.exit(0);
};

init();
