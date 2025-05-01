import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { Order } from "@/types/v2/Order.type";
import ky from "ky";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";


export const PUT = async (req: NextRequest) => {
  try {
    let debug: string = "";
    const body = await req.json();
    const { _id, ...rest } = body as Order;

    const prevOrder = await OrderRepository.findOne({ _id: new ObjectId(_id) });

    if (!prevOrder) {
      return NextResponse.json(
        { error: "No se encontro la orden" },
        { status: 404 },
      );
    }

    const { status, paid } = rest as Order;

    await OrderRepository.update({ _id: new ObjectId(_id) }, {
      ...(status && { status }),
      ...(paid && { paid }),
    });

    const buyerFound = await BuyerRepository.findOne({ _id: new ObjectId(prevOrder.buyer) });

    if (!buyerFound) {
      return NextResponse.json(
        { error: "No se encontro el comprador" },
        { status: 404 },
      );
    }

    debug = "No se edito el inventario";

    if (paid && !prevOrder.advancedPayment && !buyerFound.isChain) {
      const productsToSend = (prevOrder.products || []).map((key) => {
        return {
          id: key.product,
          quantity: key.quantity,
        };
      });

      await ky.post(
        `${process.env.NEXT_PUBLIC_URL}/api/orders/new/edit-inventory`,
        { json: { products: productsToSend } },
      );
      debug = "Se edito el inventario";
    }

    return NextResponse.json({ message: "Order updated successfully", debug });
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
