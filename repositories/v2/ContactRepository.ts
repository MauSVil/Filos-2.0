import clientPromise from "@/mongodb";
import { Contact } from "@/types/RepositoryTypes/Contact";
import { Db, Filter } from "mongodb";

let client;
let db: Db;
const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

const collectionName = "whatsapp-contacts";

export class ContactRepository {
  static async findOne(filter: Filter<Contact>) {
    await init();
    let parsedFilter = {};
    if (filter._id) {
      const { ObjectId } = await import("mongodb");
      parsedFilter = { _id: new ObjectId(filter._id as string) };
    }
    const contact = await db.collection<Contact>(collectionName).findOne({
      ...filter, ...parsedFilter
    });
    return contact;
  }

  static async find(filter: Filter<Contact>) {
    await init();
    const contacts = await db.collection<Contact>(collectionName).find(filter).toArray();
    return contacts;
  }

  static async insertOne(contact: Contact) {
    await init();
    const result = await db.collection<Contact>(collectionName).insertOne(contact);
    return result;
  }

  static async updateOne(filter: Filter<Contact>, update: Partial<Contact>) {
    await init();
    let parsedFilter = {};
    if (filter._id) {
      const { ObjectId } = await import("mongodb");
      parsedFilter = { _id: new ObjectId(filter._id as string) };
    }

    const result = await db.collection<Contact>(collectionName).updateOne({ ...filter, ...parsedFilter }, { $set: update });
    return result;
  }

  static async count(filter: Filter<Contact> = {}) {
    await init();
    const count = await db.collection<Contact>(collectionName).countDocuments(filter);
    return count;
  }
}