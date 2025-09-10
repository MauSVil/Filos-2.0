import clientPromise from "@/mongodb";
import { MongoUser } from "@/types/RepositoryTypes/User";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

const collectionName = "users";

export class UserRepository {
  static async findOne(filter: Filter<MongoUser>) {
    await init();
    const user = await db.collection<MongoUser>(collectionName).findOne(filter);
    return user;
  }

  static async find(filter: Filter<MongoUser>) {
    await init();
    const users = await db.collection<MongoUser>(collectionName).find(filter).toArray();
    return users;
  }

  static async insertOne(user: MongoUser) {
    await init();
    const result = await db.collection<MongoUser>(collectionName).insertOne(user);
    return result;
  }

  static async updateOne(filter: Filter<MongoUser>, update: Partial<MongoUser>) {
    await init();
    let parsedFilter = {};
    if (filter._id) {
      const { ObjectId } = await import("mongodb");
      parsedFilter = { _id: new ObjectId(filter._id as string) };
    }

    const result = await db.collection<MongoUser>(collectionName).updateOne(parsedFilter, { $set: update });
    return result;
  }
}