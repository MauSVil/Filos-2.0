import { Db, ObjectId } from "mongodb";

import {
  ThreadPrice,
  ThreadPriceInput,
  ThreadPriceInputModel,
  ThreadPriceRepositoryFilter,
  ThreadPriceRepositoryFilterModel,
} from "@/types/RepositoryTypes/ThreadPrice";
import clientPromise from "@/mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class ThreadPriceRepository {
  static async findOne(
    filter: ThreadPriceRepositoryFilter = {},
  ): Promise<ThreadPrice | null> {
    await init();
    const filters = await ThreadPriceRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;
    const threadPrice = await db.collection("threadPrices").findOne<ThreadPrice>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });

    return threadPrice;
  }

  static async find(
    filter: ThreadPriceRepositoryFilter = {},
  ): Promise<ThreadPrice[]> {
    await init();
    const filters = await ThreadPriceRepositoryFilterModel.parse(filter);
    const { id, year, startDate, endDate, ...rest } = filters;

    const query: any = { ...rest };

    if (year) {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    if (id) {
      query._id = new ObjectId(id);
    }

    const threadPrices = await db
      .collection("threadPrices")
      .find<ThreadPrice>(query)
      .sort({ date: -1 })
      .toArray();

    return threadPrices;
  }

  static async create(input: ThreadPriceInput): Promise<ThreadPrice> {
    await init();
    const data = await ThreadPriceInputModel.parse(input);
    const now = new Date();

    const { _id, ...threadPriceData } = data;

    const threadPrice = {
      ...threadPriceData,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection("threadPrices").insertOne(threadPrice);

    return {
      ...threadPrice,
      _id: result.insertedId.toString(),
    } as ThreadPrice;
  }

  static async update(
    id: string,
    input: Partial<ThreadPriceInput>,
  ): Promise<ThreadPrice | null> {
    await init();
    const data = await ThreadPriceInputModel.partial().parse(input);

    const result = await db.collection("threadPrices").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    return result as ThreadPrice | null;
  }

  static async delete(id: string): Promise<boolean> {
    await init();
    const result = await db
      .collection("threadPrices")
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  }

  /**
   * Get the most recent thread price (by date)
   */
  static async getLatest(): Promise<ThreadPrice | null> {
    await init();
    const threadPrice = await db
      .collection("threadPrices")
      .findOne<ThreadPrice>({}, { sort: { date: -1 } });

    return threadPrice;
  }
}
