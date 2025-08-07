import path from "path";
import fs from "fs/promises";

import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import _ from "lodash";
import moment from "moment-timezone";

import { uploadImage } from "@/utils/aws/uploadImage";
import { FileService } from "@/services/file.service";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { ObjectId } from "mongodb";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const order = await OrderRepository.findOne({ _id: new ObjectId(body.id) });

    if (!order) {
      return NextResponse.json(
        { error: "No se encontro la orden" },
        { status: 404 },
      );
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

    const totalQuantity = products.reduce(
      (acc, product) => acc + product.quantity,
      0,
    );

    const buyerDocument = await BuyerRepository.findOne({ _id: new ObjectId(buyer) });

    if (!buyerDocument) {
      return NextResponse.json(
        { error: "No se encontro el comprador" },
        { status: 404 },
      );
    }
    const {
      name: buyerName,
      phone: buyerPhone,
      address: buyerAddress,
      email: buyerEmail,
    } = buyerDocument;

    const productsIds = products.map((product) => product.product.toString());
    const productsFound = await ProductRepository.find({ _id: { $in: productsIds.map(pi => new ObjectId(pi)) } });
    const productsMapped = _.keyBy(productsFound, "_id");

    const templatePath = path.join(
      process.cwd(),
      "app",
      "api",
      "v2",
      "orders",
      "generatePDF",
      "template.html",
    );
    const file = await fs.readFile(templatePath, "utf8");
    const fileBlob = new Blob([file], { type: "text/html" });

    const myProductsToSend = products
      .filter((p) => p.quantity > 0)
      .map((productObj) => {
        return {
          quantity: productObj.quantity,
          image: productsMapped[productObj.product].image,
          color: productsMapped[productObj.product].color,
          uniqId: productsMapped[productObj.product].uniqId,
          size: productsMapped[productObj.product].size,
          // @ts-ignore
          price: productsMapped[productObj.product][orderType],
          // @ts-ignore
          total:
            productsMapped[productObj.product][orderType] * productObj.quantity,
        };
      });

    const data = {
      title: "Orden de compra",
      name: buyerName,
      createdAt: moment(requestDate)
        .tz("America/Mexico_City")
        .format("DD-MM-YYYY"),
      dueDate: moment(dueDate).tz("America/Mexico_City").format("DD-MM-YYYY"),
      phone: buyerPhone,
      email: buyerEmail,
      address: buyerAddress,
      products: myProductsToSend,
      totalQuantity,
      totalAmount,
      freightPrice,
      advancedPayment,
      superTotal: finalAmount - advancedPayment,
    };

    const formData = new FormData();

    formData.append("file", fileBlob);
    formData.append("data", JSON.stringify(data));

    const pdfResponse = await ky.post(
      "https://utils.mausvil.dev/generate_pdf",
      {
        body: formData,
        timeout: false,
      },
    );

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(pdfBuffer);

    try { await FileService.uploadFile('orders', body.id, buffer, 'application/pdf', true) }
    catch { console.error('Error uploading file to Minio') }

    const url = await uploadImage(`orderDocs/${body.id}.pdf`, buffer);

    await OrderRepository.update({ _id: new ObjectId(body.id)}, {
      documents: {
        order: url,
      },
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="orden.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Hubo un error [GeneratePDF]" },
      { status: 500 },
    );
  }
};
