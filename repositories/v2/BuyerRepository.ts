import clientPromise from "@/mongodb";
import { BuyerServerType } from "@/types/v2/Buyer/Server.type";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class BuyerRepository {
  static async find(filter: Filter<BuyerServerType>) {
    await init();
    const buyers = await db.collection<BuyerServerType>("buyers").find(filter).toArray();
    return buyers;
  }

  static async findOne(filter: Filter<BuyerServerType>) {
    await init();
    const buyer = await db.collection<BuyerServerType>("buyers").findOne(filter);
    return buyer;
  }
}