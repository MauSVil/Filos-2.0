import { NextRequest, NextResponse } from "next/server";

import { ProductsRepository } from "@/repositories/products.repository";
import {
  ProductInput,
  ProductInputModel,
} from "@/types/RepositoryTypes/Product";
import { FileService } from "@/services/file.service";

export const PUT = async (
  req: NextRequest,
  params: { params: Promise<{ id: string }> },
) => {
  let dataVerified: ProductInput;
  const { id } = await params.params;
  const formData = await req.formData();

  if (!id) throw new Error("Product ID is required");

  try {
    const prevData = JSON.parse(formData.get("data") as string);

    dataVerified = await ProductInputModel.parseAsync(prevData);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Ha ocurrido un problema P.1", devError: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  let url: string;

  try {
    const image = formData.get("image") as File | string;

    if (image && typeof image !== "string") {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      url = await FileService.uploadFile('products', id, buffer, 'image/png', true);
      dataVerified.image = url;
      dataVerified.minioImage = url;
    }

    if (image && typeof image === "string" && image !== 'undefined') {
      dataVerified.image = image;
      dataVerified.minioImage = image;
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Ha ocurrido un problema P.2", devError: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    await ProductsRepository.updateOne({
      _id: id,
      ...dataVerified,
    });

    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest, params: { params: Promise<{ id: string }> }) => {
  const { id } = await params.params;

  try {
    if (!id) throw new Error('El ID del producto es requerido');
    await ProductsRepository.updateOne({
      _id: id,
      deleted_at: new Date(),
    })
    return NextResponse.json(
      { message: "El producto ha sido eliminado correctamente" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
