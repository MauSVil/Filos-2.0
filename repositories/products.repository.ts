import { Db, ObjectId } from "mongodb";

import { HistoryMovementsRepository } from "./historymovements.repository";

import {
  Product,
  ProductInput,
  ProductInputModel,
  ProductRepositoryFilter,
  ProductRepositoryFilterModel,
} from "@/types/RepositoryTypes/Product";
import clientPromise from "@/mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class ProductsRepository {
  static async findOne(
    filter: ProductRepositoryFilter = {},
  ): Promise<Product | null> {
    await init();
    const filters = await ProductRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;
    const product = await db.collection("products").findOne<Product>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });

    return product;
  }

  static async find(filter: ProductRepositoryFilter = {}): Promise<Product[]> {
    await init();
    const filters = await ProductRepositoryFilterModel.parse(filter);
    const { q, disponibility, ids, id, ...rest } = filters;

    const productsIds = ids?.map((id) => new ObjectId(id));

    const messages = await db
      .collection("products")
      .find<Product>({
        ...rest,
        ...(q
          ? {
              $or: [
                { uniqId: { $regex: q, $options: "i" } },
                { name: { $regex: q, $options: "i" } },
              ],
            }
          : {}),
        ...(productsIds && { _id: { $in: productsIds } }),
        ...(id && { _id: new ObjectId(id) }),
      })
      .toArray();

    return messages;
  }

  static async insertOne(product: ProductInput) {
    await init();
    const productParsed = await ProductInputModel.parse(product);
    const { _id, ...rest } = productParsed;

    const { insertedId } = await db.collection("products").insertOne(rest);

    await HistoryMovementsRepository.insertOne({
      values: rest,
      type: "insert",
      collection: "products",
    });

    return insertedId;
  }

  static async count(filter: ProductRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await ProductRepositoryFilterModel.parse(filter);
    const { page, q, disponibility, ...rest } = filters;
    const count = await db.collection("products").countDocuments({
      ...rest,
      ...(q
        ? {
            $or: [
              { uniqId: { $regex: q, $options: "i" } },
              { name: { $regex: q, $options: "i" } },
            ],
          }
        : {}),
    });

    return count;
  }

  static async updateOne(product: Partial<ProductInput>) {
    await init();
    const { _id, ...rest } = await ProductInputModel.partial().parse(product);
    const id = new ObjectId(_id);

    await db.collection("products").updateOne({ _id: id }, { $set: rest });
    await HistoryMovementsRepository.insertOne({
      values: rest,
      type: "update",
      collection: "products",
    });

    return "Product updated";
  }
}
