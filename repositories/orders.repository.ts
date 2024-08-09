import clientPromise from "@/mongodb";
import { Product } from "@/types/MongoTypes/Product";
import { OrderRepositoryFilter, OrderRepositoryFilterModel } from "@/types/RepositoryTypes/Order";
import _ from "lodash";
import { Db } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class OrdersRepository {
  static async findOne(filter: OrderRepositoryFilter = {}): Promise<Product | null> {
    await init();
    const filters = await OrderRepositoryFilterModel.parse(filter);
    const chat = await db.collection('orders').findOne<Product>(filters);
    return chat;
  }

  static async find(filter: OrderRepositoryFilter = {}): Promise<Product[]> {
    await init();
    const filters = await OrderRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const messages = await db.collection('orders').find<Product>({
      ...rest,
      status: 'Pendiente'
    }).skip(((page || 1) - 1) * 10).limit(10).toArray();
    return messages;
  }

  static async count(filter: OrderRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await OrderRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const count = await db.collection('orders').countDocuments({
      ...rest,
      status: 'Pendiente'
    });
    return count;
  }

  // static async insertOne(message: ProductInput) {
  //   await init();
  //   message.timestamp = new Date();
  //   message.role = 'assistant';
  //   const messageParsed = await ProductInputModel.parse(message);
  //   await db.collection('products').insertOne(messageParsed);
  //   return 'Message inserted';
  // }

  // static async updateOne() {
  // }

  // static async deleteOne() {
  // }
}