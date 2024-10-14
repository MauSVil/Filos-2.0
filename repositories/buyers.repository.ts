import clientPromise from "@/mongodb";
import { Buyer } from "@/types/MongoTypes/Buyer";
import { BuyerInput, BuyerRepositoryFilter, BuyerRepositoryFilterModel } from "@/types/RepositoryTypes/Buyer";
import _ from "lodash";
import { Db, ObjectId } from "mongodb";

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
    const { id, ...rest } = filters;
    const buyer = await db.collection('buyers').findOne<Buyer>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });
    return buyer;
  }

  static async find(filter: BuyerRepositoryFilter = {}): Promise<Buyer[]> {
    await init();
    const filters = await BuyerRepositoryFilterModel.parse(filter);
    const { page, buyers: buyersIds, ...rest } = filters;

    const buyersObjectIds = buyersIds?.map((id) => new ObjectId(id));

    const buyers = await db.collection('buyers').find<Buyer>({
      ...rest,
      ...(buyersIds && { _id: { $in: buyersObjectIds } }),
    }).toArray();
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

  static async insertOne(input: BuyerInput) {
    await init();
    input.createdAt = new Date();
    input.updatedAt = new Date();
    input.deletedAt = undefined;
    input.version = 2;
    await db.collection('buyers').insertOne(input);
    return 'Buyer inserted';
  }

  // static async updateOne() {
  // }

  // static async deleteOne() {
  // }
}