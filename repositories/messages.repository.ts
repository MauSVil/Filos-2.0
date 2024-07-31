import clientPromise from "@/mongodb";
import { MessageRepositoryFilter, MessageRepositoryFilterModel } from "@/types/RepositoryTypes/Message";
import _ from "lodash";
import { Db } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class MessagesRepository {
  static async findOne(filter: MessageRepositoryFilter = {}) {
    await init();
    const filters = await MessageRepositoryFilterModel.parse(filter);
    const chat = await db.collection('whatsapp-messages').findOne(filters);
    return chat;
  }

  static async find(filter: MessageRepositoryFilter = {}) {
    await init();
    const filters = await MessageRepositoryFilterModel.parse(filter);
    const messages = await db.collection('whatsapp-messages').find(filters).toArray();
    return messages;
  }

  static async insertOne() {
  }

  static async updateOne() {
  }

  static async deleteOne() {
  }
}