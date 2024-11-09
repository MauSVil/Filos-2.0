import clientPromise from "@/mongodb";
import { MovementHistory } from "@/types/RepositoryTypes/MovementHistory";
import _ from "lodash";
import { Db, ObjectId } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class HistoryMovementsRepository {
  static async findOne(id: string): Promise<MovementHistory | null> {
    await init();
    const movementHistory = await db.collection('MovementHistory').findOne<MovementHistory>({ _id: new ObjectId(id) });
    return movementHistory;
  }

  static async find(): Promise<MovementHistory[]> {
    await init();
    const movementsHistory = await db.collection('MovementHistory').find<MovementHistory>({}).toArray();
    return movementsHistory;
  }

  static async insertOne(input: Omit<MovementHistory, '_id'>) {
    try {
      await init();
      input.createdAt = new Date();
      input.updatedAt = new Date();
      input.deletedAt = null;
      await db.collection('MovementHistory').insertOne(input);
      return 'Movement history inserted';
    } catch (error) {
      console.log(error);
      return 'Movement history inserted';
    }
  }
}