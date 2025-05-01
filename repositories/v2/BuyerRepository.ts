import clientPromise from "@/mongodb";
import { BuyerBaseWithIdType } from "@/types/v2/Buyer/Base.type";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class BuyerRepository {
  static async find(filter: Filter<BuyerBaseWithIdType>) {
    await init();
    const buyers = await db.collection<BuyerBaseWithIdType>("buyers").find(filter).toArray();
    return buyers;
  }

  static async findOne(filter: Filter<BuyerBaseWithIdType>) {
    await init();
    const buyer = await db.collection<BuyerBaseWithIdType>("buyers").findOne(filter);
    return buyer;
  }
}