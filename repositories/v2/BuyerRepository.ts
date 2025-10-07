import clientPromise from "@/mongodb";
import { BuyerBaseWithIdType, BuyerInputType } from "@/types/v2/Buyer/Base.type";
import { Db, Filter, ObjectId } from "mongodb";
import moment from "moment-timezone";

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

  static async count(filter: Filter<BuyerBaseWithIdType>) {
    await init();
    const count = await db.collection<BuyerBaseWithIdType>("buyers").countDocuments(filter);
    return count;
  }

  static async insertOne(input: BuyerInputType) {
    await init();
    const now = moment().tz("America/Mexico_City").toDate();
    const buyerData = {
      ...input,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    };
    const result = await db.collection("buyers").insertOne(buyerData);
    return result;
  }

  static async updateOne(id: string, input: Partial<BuyerInputType>) {
    await init();
    const now = moment().tz("America/Mexico_City").toDate();
    const updateData = {
      ...input,
      updatedAt: now,
    };
    const result = await db.collection("buyers").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  }
}