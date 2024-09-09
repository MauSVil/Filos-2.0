import { OrdersRepository } from "@/repositories/orders.repository";
import { ProductsRepository } from "@/repositories/products.repository";
import { Product } from "@/types/MongoTypes/Product";
import { OrderInput, OrderInputModel } from "@/types/RepositoryTypes/Order";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { orderType } = body as { orderType: 'retailPrice' | 'wholesalePrice' | 'specialPrice' | 'webPagePrice' };

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
  
    const newBody: OrderInput = {
      ...body,
      products: productsParsed,
      status: 'Pendiente',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      requestDate: new Date(),
      totalAmount: 0,
      finalAmount: 0,
      paid: false,
    }

    const newBodyParsed = await OrderInputModel.parse(newBody);
    newBodyParsed.paid = false;
    newBodyParsed.totalAmount = _.sumBy(productsParsed, 'total');
    newBodyParsed.finalAmount = _.sumBy(productsParsed, 'total') + newBodyParsed.freightPrice - newBodyParsed.advancedPayment;

    await OrdersRepository.insertOne(newBodyParsed);
    return NextResponse.json({ message: 'Orden creada exitosamente' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Hubo un error [NewOrder]' }, { status: 500 });
  }
}