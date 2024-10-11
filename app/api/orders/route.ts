import { OrdersRepository } from "@/repositories/orders.repository";
import { ProductsRepository } from "@/repositories/products.repository";
import { Order } from "@/types/MongoTypes/Order";
import { Product } from "@/types/MongoTypes/Product";
import { OrderInput, OrderUpdateInputModel } from "@/types/RepositoryTypes/Order";
import ky from "ky";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json() as { id: string };
    const { id } = body;

    const order = await OrdersRepository.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: 'No se encontro la orden' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Hubo un error [NewOrder]' }, { status: 500 });
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { _id, ...rest } = body as Order;
    
    const prevOrder = await OrdersRepository.findOne({ id: _id });
    
    if (!prevOrder) {
      return NextResponse.json({ error: 'No se encontro la orden' }, { status: 404 });
    }

    if (prevOrder.paid) {
      return NextResponse.json({ error: 'No se puede editar una orden ya pagada' }, { status: 400 });
    }
  
    if (prevOrder?.advancedPayment || 0 > 0) {
      return NextResponse.json({ error: 'No se puede editar una orden con anticipo' }, { status: 400 });
    }

    const {
      name,
      buyer,
      orderType,
      dueDate,
      freightPrice,
      advancedPayment,
      description,
    } = rest as Order;

    if (advancedPayment > 0 && !prevOrder.paid) {
      const parsedProducts = Object.keys(body.products).map((key) => {
        return {
          id: key,
          quantity: body.products[key].quantity,
        }
      });
      await ky.post(`${process.env.NEXT_PUBLIC_URL}/api/orders/new/edit-inventory`, { json: { products: parsedProducts }})
    }

    const productsIds = Object.keys(body.products);
    const products = await ProductsRepository.find({ ids: productsIds });
    const productsMapped: { [key: string]: Product } = _.keyBy(products, '_id') as { [key: string]: Product };
    const productsParsed = Object.keys(body.products).map((key) => {
      const product = productsMapped[key];
      return {
        product: key,
        quantity: body.products[key].quantity,
        total: product[orderType] * body.products[key].quantity
      }
    });

    const newOrder: OrderInput = {
      ...prevOrder,
      name,
      buyer,
      orderType,
      dueDate: new Date(dueDate),
      freightPrice,
      advancedPayment,
      description,
      products: productsParsed,
      status: 'Pendiente',
      updated_at: new Date(),
      documents: {
        order: '',
      }
    }

    newOrder.paid = false;
    newOrder.totalAmount = _.sumBy(productsParsed, 'total');
    newOrder.finalAmount = _.sumBy(productsParsed, 'total') + newOrder.freightPrice - newOrder.advancedPayment;

    await OrdersRepository.updateOne(_id, newOrder);

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Hubo un error [NewOrder]' }, { status: 500 });
  }
}