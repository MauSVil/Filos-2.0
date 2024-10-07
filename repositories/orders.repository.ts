import clientPromise from "@/mongodb";
import { Order } from "@/types/MongoTypes/Order";
import { OrderInput, OrderInputModel, OrderRepositoryFilter, OrderRepositoryFilterModel, OrderUpdateInputModel } from "@/types/RepositoryTypes/Order";
import _ from "lodash";
import { Db, ObjectId } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class OrdersRepository {
  static async findOne(filter: OrderRepositoryFilter = {}): Promise<Order | null> {
    await init();
    const filters = await OrderRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;
    const order = await db.collection('orders').findOne<Order>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });
    return order;
  }

  static async find(filter: OrderRepositoryFilter = {}): Promise<Order[]> {
    await init();
    const filters = await OrderRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const orders = await db.collection('orders').find<Order>({
      ...rest,
    }).sort({ created_at: -1 }).toArray();
    return orders;
  }

  static async count(filter: OrderRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await OrderRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const count = await db.collection('orders').countDocuments({
      ...rest,
    });
    return count;
  }

  static async insertOne(order: OrderInput) {
    await init();
    const orderParsed = await OrderInputModel.parse(order);
    await db.collection('orders').insertOne(orderParsed);
    return 'Order inserted';
  }

  static async updateOne(id: string, order: Partial<OrderInput>) {
    await init();
    const orderParsed = await OrderUpdateInputModel.parse(order);
    await db.collection('orders').updateOne({ _id: new ObjectId(id) }, { $set: orderParsed });
    return 'Order updated';
  }

  // static async deleteOne() {
  // }
}