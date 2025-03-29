import ky from "ky";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment-timezone";

import { BuyersRepository } from "@/repositories/buyers.repository";
import { OrdersRepository } from "@/repositories/orders.repository";
import { ProductsRepository } from "@/repositories/products.repository";
import { Product } from "@/types/MongoTypes/Product";
import { OrderInput, OrderInputModel } from "@/types/RepositoryTypes/Order";

export const POST = async (req: NextRequest) => {
  try {
    let debug: string = "";
    const body = await req.json();
    const { orderType } = body as {
      orderType:
        | "retailPrice"
        | "wholesalePrice"
        | "specialPrice"
        | "webPagePrice";
    };

    const productsIds = Object.keys(body.products);
    const products = await ProductsRepository.find({ ids: productsIds });
    const productsMapped: { [key: string]: Product } = _.keyBy(
      products,
      "_id",
    ) as { [key: string]: Product };

    const productsParsed = Object.keys(body.products).map((key) => {
      const product = productsMapped[key];

      return {
        product: key,
        quantity: body.products[key].quantity,
        total: product[orderType] * body.products[key].quantity,
      };
    });

    const newBody: OrderInput = {
      ...body,
      products: productsParsed,
      status: "Pendiente",
      created_at: moment().tz("America/Mexico_City").toDate(),
      updated_at: moment().tz("America/Mexico_City").toDate(),
      deleted_at: null,
      requestDate: moment().tz("America/Mexico_City").toDate(),
      totalAmount: 0,
      finalAmount: 0,
      paid: false,
    };

    const newBodyParsed = await OrderInputModel.parse(newBody);

    newBodyParsed.paid = false;
    newBodyParsed.totalAmount = _.sumBy(productsParsed, "total");
    newBodyParsed.finalAmount =
      _.sumBy(productsParsed, "total") +
      newBodyParsed.freightPrice -
      newBodyParsed.advancedPayment;

    await OrdersRepository.insertOne(newBodyParsed);

    const buyerFound = await BuyersRepository.findOne({ id: newBody.buyer });

    if (!buyerFound) {
      return NextResponse.json(
        { error: "No se encontro el comprador" },
        { status: 404 },
      );
    }

    debug = "No se edito el inventario";

    if (newBody.advancedPayment > 0 && !buyerFound.isChain) {
      const productsToSend = Object.keys(body.products).map((key) => {
        return {
          id: key,
          quantity: body.products[key].quantity,
        };
      });

      await ky.post(
        `${process.env.NEXT_PUBLIC_URL}/api/orders/new/edit-inventory`,
        { json: { products: productsToSend } },
      );
      debug = "Se edito el inventario";
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return NextResponse.json({ message: "Orden creada exitosamente", debug });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Hubo un error [NewOrder]" },
      { status: 500 },
    );
  }
};
