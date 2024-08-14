import clientPromise from "@/mongodb";
import { Buyer } from "@/types/MongoTypes/Buyer";
import { BuyerRepositoryFilter, BuyerRepositoryFilterModel } from "@/types/RepositoryTypes/Buyer";
import _ from "lodash";
import { Db } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class BuyersRepository {
  static async findOne(filter: BuyerRepositoryFilter = {}): Promise<Buyer | null> {
    await init();
    const filters = await BuyerRepositoryFilterModel.parse(filter);
    const buyer = await db.collection('buyers').findOne<Buyer>(filters);
    return buyer;
  }

  static async find(filter: BuyerRepositoryFilter = {}): Promise<Buyer[]> {
    await init();
    const filters = await BuyerRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const buyers = await db.collection('buyers').find<Buyer>({
      ...rest,
    }).skip(((page || 1) - 1) * 10).limit(10).toArray();
    return buyers;
  }

  static async count(filter: BuyerRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await BuyerRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const count = await db.collection('buyers').countDocuments({
      ...rest,
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