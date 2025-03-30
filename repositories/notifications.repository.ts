import { Db, ObjectId } from "mongodb";

import clientPromise from "@/mongodb";
import {
  Notification,
  NotificationRepositoryFilter,
  NotificationRepositoryFilterModel,
} from "@/types/RepositoryTypes/Notification";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class NotificationsRepository {
  static async findOne(
    filter: NotificationRepositoryFilter = {},
  ): Promise<Notification | null> {
    await init();
    const filters = await NotificationRepositoryFilterModel.parse(filter);
    const chat = await db
      .collection("notifications")
      .findOne<Notification>(filters);

    return chat;
  }

  static async find(
    filter: NotificationRepositoryFilter = {},
  ): Promise<Notification[]> {
    await init();
    const filters = await NotificationRepositoryFilterModel.parse(filter);
    const messages = await db
      .collection("notifications")
      .find<Notification>(filters)
      .sort({ timestamp: -1 })
      .toArray();

    return messages;
  }

  static async count(
    filter: NotificationRepositoryFilter = {},
  ): Promise<number> {
    await init();
    const filters = await NotificationRepositoryFilterModel.parse(filter);
    const { page, ...rest } = filters;
    const count = await db.collection("notifications").countDocuments({
      ...rest,
      status: "Pendiente",
    });

    return count;
  }

  // static async insertOne(message: ProductInput) {
  //   await init();
  //   message.timestamp = new Date();
  //   message.role = 'assistant';
  //   const messageParsed = await ProductInputModel.parse(message);
  //   await db.collection('products').insertOne(messageParsed);
  //   return 'Message inserted';
  // }

  static async updateOne(id: string, update: Partial<Notification>) {
    await init();
    await db
      .collection("notifications")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return "Notification updated";
  }

  // static async deleteOne() {
  // }
}
