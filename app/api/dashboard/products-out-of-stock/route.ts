import { OrdersRepository } from "@/repositories/orders.repository";
import { ProductsRepository } from "@/repositories/products.repository";
import { Product } from "@/types/MongoTypes/Product";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { startDate, endDate } = body;

    const orders = await OrdersRepository.find({
      dueDateRange: {
        from: startDate,
        to: endDate,
      },
      orConditions: [
        { advancedPayment: { $gt: 0 } },
        { paid: true, }
      ]
    });
  
    const productsIds = orders.reduce((acc, order) => {
      return acc.concat(order.products.map(({ product }) => product.toString()));
    }, [] as string[]);

    const products = await ProductsRepository.find({ ids: productsIds });
    const productsMapped = _.keyBy(products, '_id');

    const productQuantities: { [key: string]: number } = {};

    orders.forEach(order => {
      order.products.forEach(({ product, quantity }) => {
        if (!productQuantities[product]) {
          productQuantities[product] = 0;
        }
        productQuantities[product] += quantity;
      });
    });

    const finalProductsObj: { [key: string]: Product } = {};

    Object.keys(productQuantities).forEach(productId => {
      const product = productsMapped[productId];
      
      if (product.quantity - productQuantities[productId] < 0) {
        finalProductsObj[productId] = {
          ...product,
          quantity: product.quantity - productQuantities[productId],
        };
      }
    });

    return NextResponse.json({ data: finalProductsObj });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}