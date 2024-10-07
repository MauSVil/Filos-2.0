import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import path from "path";
import fs from "fs/promises";
import moment from "moment";
import { OrdersRepository } from "@/repositories/orders.repository";
import { ObjectId } from "mongodb";
import { BuyersRepository } from "@/repositories/buyers.repository";
import { ProductsRepository } from "@/repositories/products.repository";
import _ from "lodash";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const order = await OrdersRepository.findOne({ id: body.id });

    if (!order) {
      return NextResponse.json({ error: 'No se encontro la orden' }, { status: 404 });
    }

    const {
      products,
      totalAmount,
      freightPrice,
      advancedPayment,
      finalAmount,
      requestDate,
      dueDate,
      buyer,
      orderType,
    } = order;

    const totalQuantity = products.reduce((acc, product) => acc + product.quantity, 0);

    const buyerDocument = await BuyersRepository.findOne({ id: buyer });
    if (!buyerDocument) {
      return NextResponse.json({ error: 'No se encontro el comprador' }, { status: 404 });
    }
    const {
      name: buyerName,
      phone: buyerPhone,
      address: buyerAddress,
      email: buyerEmail,
    } = buyerDocument;

    const productsIds = products.map((product) => product.product.toString());
    const productsFound = await ProductsRepository.find({ ids: productsIds });
    const productsMapped = _.keyBy(productsFound, '_id');

    const templatePath = path.join(process.cwd(), 'app', 'api', 'orders', 'generatePDF', 'template.html');
    const file = await fs.readFile(templatePath, 'utf8');
    const fileBlob = new Blob([file], { type: 'text/html' });

    const myProductsToSend = products.map((productObj) => {
      return {
        quantity: productObj.quantity,
        image: productsMapped[productObj.product].image,
        color: productsMapped[productObj.product].color,
        uniqId: productsMapped[productObj.product].uniqId,
        size: productsMapped[productObj.product].size,
        // @ts-ignore
        price: productsMapped[productObj.product][orderType],
        // @ts-ignore
        total: productsMapped[productObj.product][orderType] * productObj.quantity,
      }
    });

    const data = {
      title: 'Orden de compra',
      name: buyerName,
      createdAt: moment(requestDate).format('DD-MM-YYYY'),
      dueDate: moment(dueDate).format('DD-MM-YYYY'),
      phone: buyerPhone,
      email: buyerEmail,
      address: buyerAddress,
      products: myProductsToSend,
      totalQuantity,
      totalAmount,
      freightPrice,
      advancedPayment,
      superTotal: finalAmount - advancedPayment,
    }

    const formData = new FormData();
    formData.append('file', fileBlob);
    formData.append('data', JSON.stringify(data));

    const pdfResponse = await ky.post('https://utils.mausvil.dev/generate_pdf', {
      body: formData,
      timeout: false,
    });

    const pdfBuffer = await pdfResponse.arrayBuffer();

    

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="orden.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Hubo un error [GeneratePDF]' }, { status: 500 });
  }
}