import clientPromise from "@/mongodb";
import { Contact } from "@/types/MongoTypes/Contact";
import { ContactInput, ContactRepositoryFilter, ContactRepositoryFilterModel } from "@/types/RepositoryTypes/Contact";
import _ from "lodash";
import { Db } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class ContactsRepository {
  static async findOne(filter: ContactRepositoryFilter = {}): Promise<Contact | null> {
    await init();
    const filters = await ContactRepositoryFilterModel.parse(filter);
    const contact = await db.collection('whatsapp-contacts').findOne<Contact>(filters);
    return contact;
  }

  static async find(filter: ContactRepositoryFilter = {}): Promise<Contact[]> {
    await init();
    const filters = await ContactRepositoryFilterModel.parse(filter);

    const contacts = await db.collection('whatsapp-contacts').find<Contact>(filters).toArray();
    return contacts;
  }

  static async count(filter: ContactRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await ContactRepositoryFilterModel.parse(filter);
    const count = await db.collection('whatsapp-contacts').countDocuments(filters);
    return count;
  }

  static async insertOne(input: ContactInput) {
    await init();
    await db.collection('whatsapp-contacts').insertOne(input);
    return 'Contact inserted';
  }

  // static async updateOne() {
  // }

  // static async deleteOne() {
  // }
}