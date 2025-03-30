import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

import { BuyersRepository } from "@/repositories/buyers.repository";
import { OrdersRepository } from "@/repositories/orders.repository";
import { Order } from "@/types/RepositoryTypes/Order";

export const PUT = async (req: NextRequest) => {
  try {
    let debug: string = "";
    const body = await req.json();
    const { _id, ...rest } = body as Order;

    const prevOrder = await OrdersRepository.findOne({ id: _id });

    if (!prevOrder) {
      return NextResponse.json(
        { error: "No se encontro la orden" },
        { status: 404 },
      );
    }

    const { status, paid } = rest as Order;

    await OrdersRepository.updateOne(_id, {
      ...(status && { status }),
      ...(paid && { paid }),
    });

    const buyerFound = await BuyersRepository.findOne({ id: prevOrder.buyer });

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
