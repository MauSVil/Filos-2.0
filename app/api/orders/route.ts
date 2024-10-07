import { Order } from "@/types/MongoTypes/Order";
import { OrderUpdateInputModel } from "@/types/RepositoryTypes/Order";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json() as Order;
    const { _id, ...rest } = body;

    if (!_id) {
      return NextResponse.json({ error: 'No se encontro la orden' }, { status: 404 });
    }

    const bodyParsed = await OrderUpdateInputModel.parseAsync(rest);
    console.log(bodyParsed, 'bodyParsed');

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Hubo un error [NewOrder]' }, { status: 500 });
  }
}