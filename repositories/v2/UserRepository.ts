import clientPromise from "@/mongodb";
import { MongoUser, User } from "@/types/RepositoryTypes/User";
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
}