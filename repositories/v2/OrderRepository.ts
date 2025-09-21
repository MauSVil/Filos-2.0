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

  static async count(filter: Filter<OrderBaseWithIdType>) {
    await init();
    const count = await db.collection<OrderBaseWithIdType>("orders").countDocuments(filter);
    return count;
  }

  static async findWithOptions(filter: Filter<OrderBaseWithIdType>, options?: { limit?: number; sort?: any }) {
    await init();
    let query = db.collection<OrderBaseWithIdType>("orders").find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const orders = await query.toArray();
    return orders;
  }
}