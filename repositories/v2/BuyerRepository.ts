import clientPromise from "@/mongodb";
import { Buyer } from "@/types/RepositoryTypes/Buyer";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class BuyerRepository {
  static async find(filter: Filter<Buyer>) {
    await init();
    const buyers = await db.collection<Buyer>("buyers").find(filter).toArray();
    return buyers;
  }

  static async findOne(filter: Filter<Buyer>) {
    await init();
    const buyer = await db.collection<Buyer>("buyers").findOne(filter);
    return buyer;
  }
}