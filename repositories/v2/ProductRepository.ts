import clientPromise from "@/mongodb";
import { ProductBaseWithIdType, ProductUpdateType } from "@/types/v2/Product/Base.type";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class ProductRepository {
  static async findOne(filter: Filter<ProductBaseWithIdType>) {
    await init();
    const product = await db.collection<ProductBaseWithIdType>("products").findOne(filter);
    return product;
  }

  static async find(filter: Filter<ProductBaseWithIdType>) {
    await init();
    const products = await db.collection<ProductBaseWithIdType>("products").find(filter).toArray();
    return products;
  }

  static async updateOne(filter: Filter<ProductBaseWithIdType>, update: ProductUpdateType) {
    await init();
    const result = await db.collection<ProductBaseWithIdType>("products").updateOne(filter, { $set: update });
    return result;
  }

  static async count(filter: Filter<ProductBaseWithIdType>) {
    await init();
    const count = await db.collection<ProductBaseWithIdType>("products").countDocuments(filter);
    return count;
  }

  static async findWithOptions(filter: Filter<ProductBaseWithIdType>, options?: { limit?: number; sort?: any }) {
    await init();
    let query = db.collection<ProductBaseWithIdType>("products").find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const products = await query.toArray();
    return products;
  }
}