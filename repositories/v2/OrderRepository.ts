import clientPromise from "@/mongodb";
import { Order } from "@/types/v2/Order.type";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class OrderRepository {
  static async find(filter: Filter<Order>) {
    await init();
    const orders = await db.collection<Order>("orders").find(filter).toArray();
    return orders;
  }

  static async findOne(filter: Filter<Order>) {
    await init();
    const order = await db.collection<Order>("orders").findOne(filter);
    return order;
  }

  static async update(filter: Filter<Order>, data: Partial<Order>) {
    await init();
    const order = await db.collection<Order>("orders");
    const updatedOrder = await order.findOneAndUpdate(
      filter,
      { $set: data },
      { returnDocument: "after" },
    );
    return updatedOrder;
  }
}