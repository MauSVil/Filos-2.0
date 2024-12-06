import clientPromise from "@/mongodb";
import { User, UserRepositoryFilter, UserRepositoryFilterModel } from "@/types/RepositoryTypes/User";
import _ from "lodash";
import { Db, ObjectId } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class UsersRepository {
  static async findOne(filter: UserRepositoryFilter = {}): Promise<User | null> {
    await init();
    const filters = await UserRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;
    const user = await db.collection('users').findOne<User>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });
    return user;
  }
}