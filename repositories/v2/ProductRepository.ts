import clientPromise from "@/mongodb";
import { Product } from "@/types/v2/Product.type";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class ProductRepository {
  static async findOne(filter: Filter<Product>) {
    await init();
    const product = await db.collection<Product>("products").findOne(filter);
    return product;
  }

  static async find(filter: Filter<Product>) {
    await init();
    const products = await db.collection<Product>("products").find(filter).toArray();
    return products;
  }

  static async updateOne(filter: Filter<Product>, update: Partial<Product>) {
    await init();
    const result = await db.collection<Product>("products").updateOne(filter, { $set: update });
    return result;
  }
}