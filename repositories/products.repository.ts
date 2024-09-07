import clientPromise from "@/mongodb";
import { Product } from "@/types/MongoTypes/Product";
import { ProductInput, ProductInputModel, ProductRepositoryFilter, ProductRepositoryFilterModel } from "@/types/RepositoryTypes/Product";
import _ from "lodash";
import { Db, ObjectId } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class ProductsRepository {
  static async findOne(filter: ProductRepositoryFilter = {}): Promise<Product | null> {
    await init();
    const filters = await ProductRepositoryFilterModel.parse(filter);
    const chat = await db.collection('products').findOne<Product>(filters);
    return chat;
  }

  static async find(filter: ProductRepositoryFilter = {}): Promise<Product[]> {
    await init();
    const filters = await ProductRepositoryFilterModel.parse(filter);
    const { q, disponibility, ids, ...rest } = filters;

    const productsIds = ids?.map((id) => new ObjectId(id));

    const messages = await db.collection('products').find<Product>({
      ...rest,
      ...(q ? {
        $or: [
          { uniqId: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } }
        ]
      } : {}),
      ...(productsIds && { _id: { $in: productsIds } }),
    }).toArray();
    return messages;
  }

  static async count(filter: ProductRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await ProductRepositoryFilterModel.parse(filter);
    const { page, q, disponibility, ...rest } = filters;
    const count = await db.collection('products').countDocuments({
      ...rest,
      ...(q ? {
        $or: [
          { uniqId: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } }
        ]
      } : {}),
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