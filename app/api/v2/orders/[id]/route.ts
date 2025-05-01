import { handleError } from "@/lib/handleError";
import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { OrderInput } from "@/types/RepositoryTypes/Order";
import { Order } from "@/types/v2/Order.type";
import { Product } from "@/types/v2/Product.type";
import ky from "ky";
import _ from "lodash";
import moment from "moment";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
  
    const order = await OrderRepository.findOne({ _id: new ObjectId(id) });
  
    return NextResponse.json(order);
  } catch (error) {
    return handleError(error);
  }
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const prevOrder = await OrderRepository.findOne({ _id: new ObjectId(id) });

    let debug = "";

    if (!prevOrder) {
      return NextResponse.json(
        { error: "No se encontro la orden" },
        { status: 404 },
      );
    }

    if (prevOrder.paid) {
      return NextResponse.json(
        { error: "No se puede editar una orden ya pagada" },
        { status: 400 },
      );
    }

    if (prevOrder?.advancedPayment || 0 > 0) {
      return NextResponse.json(
        { error: "No se puede editar una orden con anticipo" },
        { status: 400 },
      );
    }

    const {
      name,
      buyer,
      orderType,
      dueDate,
      freightPrice,
      advancedPayment,
      description,
    } = body as Order;

    const buyerFound = await BuyerRepository.findOne({ _id: new ObjectId(buyer) });

    if (!buyerFound) {
      return NextResponse.json(
        { error: "No se encontro el comprador" },
        { status: 404 },
      );
    }

    debug = "No se edito el inventario";

    if (advancedPayment > 0 && !prevOrder.paid && !buyerFound.isChain) {
      const parsedProducts = Object.keys(body.products).map((key) => {
        return {
          id: key,
          quantity: body.products[key].quantity,
        };
      });

      await ky.post(
        `${process.env.NEXT_PUBLIC_URL}/api/orders/new/edit-inventory`,
        { json: { products: parsedProducts } },
      );
      debug = "Se edito el inventario";
    }

    const productsIds = Object.keys(body.products);
    const products = await ProductRepository.find({ _id: { $in: productsIds.map(pi => new ObjectId(pi)) } });
    const productsMapped: { [key: string]: Product } = _.keyBy(
      products,
      "_id",
    ) as { [key: string]: Product };
    const productsParsed = Object.keys(body.products)
      .filter((key) => body.products[key].quantity > 0)
      .map((key) => {
        const product = productsMapped[key];

        return {
          product: key,
          quantity: body.products[key].quantity,
          total: product[orderType] * body.products[key].quantity,
        };
      });

    const newOrder: OrderInput = {
      ...prevOrder,
      name,
      buyer,
      orderType,
      dueDate: moment(dueDate).tz("America/Mexico_City").toDate(),
      freightPrice,
      advancedPayment,
      description,
      products: productsParsed,
      status: "Pendiente",
      updated_at: moment().tz("America/Mexico_City").toDate(),
      documents: {
        order: "",
      },
    };

    newOrder.paid = false;
    newOrder.totalAmount = _.sumBy(productsParsed, "total");
    newOrder.finalAmount =
      _.sumBy(productsParsed, "total") +
      newOrder.freightPrice -
      newOrder.advancedPayment;

    await OrderRepository.update({ _id: new ObjectId(id) }, newOrder);

    return NextResponse.json({ message: "Order updated successfully", debug });
  
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const order = await OrderRepository.update({ _id: new ObjectId(id) }, body);

    return NextResponse.json(order);
  } catch (error) {
    return handleError(error);
  }
}