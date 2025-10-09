import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ProductsRepository } from "@/repositories/products.repository";
import {
  Product,
  ProductInput,
  ProductInputModel,
} from "@/types/RepositoryTypes/Product";
import { FileService } from "@/services/file.service";


export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const data = await formData.get("data");
  const image = (await formData.get("image")) as File;

  let dataVerified: ProductInput;

  try {
    const dataParsed = JSON.parse(data as string);

    dataVerified = await ProductInputModel.parseAsync(dataParsed);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let insertedId: string;

  try {
    const insertedIdObj = await ProductsRepository.insertOne({
      ...dataVerified,
      created_at: new Date(),
    });

    insertedId = insertedIdObj.toString();
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          devError: error.message,
          error: "[Insertar Producto] No se pudo insertar el producto P.1",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }

  let url: string;

  if (image) {
    try {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use the actual MIME type from the uploaded file
      const mimeType = image.type || 'image/png';
      url = await FileService.uploadFile('products', insertedId, buffer, mimeType, false);

    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          {
            devError: error.message,
            error: "[Insertar Producto] No se pudo insertar el producto P.2",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }

    try {
      await ProductsRepository.updateOne({ _id: insertedId, image: url, minioImage: url });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          {
            devError: error.message,
            error: "[Insertar Producto] No se pudo insertar el producto P.3",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Hello World" });
};

export const PUT = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as Partial<Product>;

    if (!body._id) throw new Error("No se encontro el producto");
    await ProductsRepository.updateOne(body);

    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
