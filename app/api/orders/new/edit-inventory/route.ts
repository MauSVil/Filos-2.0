import { ProductsRepository } from "@/repositories/products.repository";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const EditInventoryModel = z.object({
  products: z.array(z.object({
    quantity: z.coerce.number({ required_error: 'La cantidad es requerida' }),
    id: z.string(),
  })),
})

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { products } = await EditInventoryModel.parse(body);

    const productsIds = products.map((product) => product.id);

    const productsFound = await ProductsRepository.find({ ids: productsIds });
    const productsMapped = _.keyBy(productsFound, '_id');

    for (const product of products) {
      const { id, quantity } = product;
      const productFound = productsMapped[id];
      const quantityProductFound = productFound.quantity;
      await ProductsRepository.updateOne({ _id: id, quantity: quantityProductFound - quantity });
    }

    return NextResponse.json({ message: 'El inventario se edito correctamente' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Hubo un error [EditInventory]' }, { status: 500 });
  }
}