import clientPromise from "@/mongodb";
import { OrderBaseWithIdType, OrderUpdateType } from "@/types/v2/Order/Base.type";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class OrderRepository {
  static async find(filter: Filter<OrderBaseWithIdType>) {
    await init();
    const orders = await db.collection<OrderBaseWithIdType>("orders").find(filter).toArray();
    return orders;
  }

  static async findOne(filter: Filter<OrderBaseWithIdType>) {
    await init();
    const order = await db.collection<OrderBaseWithIdType>("orders").findOne(filter);
    return order;
  }

  static async update(filter: Filter<OrderBaseWithIdType>, data: OrderUpdateType) {
    await init();
    const order = await db.collection<OrderBaseWithIdType>("orders");
    const updatedOrder = await order.findOneAndUpdate(
      filter,
      { $set: data },
      { returnDocument: "after" },
    );
    return updatedOrder;
  }
}