import clientPromise from "@/mongodb";
import { Profile } from "@/types/MongoTypes/Profile";
import { ChatRepositoryFilter, ChatRepositoryFilterModel } from "@/types/RepositoryTypes/Chat";
import _ from "lodash";
import { Db } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class ContactRepository {
  static async findOne(filter: ChatRepositoryFilter = {}) {
    await init();
    const filters = await ChatRepositoryFilterModel.parse(filter);
    const contact = await db.collection('whatsapp-messages').findOne(filters);
    return contact;
  }

  static async find(filter: ChatRepositoryFilter = {}) {
    await init();
    const filters = await ChatRepositoryFilterModel.parse(filter);
    const contacts = await db.collection('whatsapp-messages').find(filters).toArray();
    // const profiles = await db.collection<Profile>('whatsapp-profiles').find().toArray();

    const groupedContacts = _.groupBy(contacts, "phone_id");
    // const groupedProfiles = _.keyBy(profiles, "phone_id");

    const contactsParsed = Object.keys(groupedContacts).map((phone_id, idx) => {
      return {
        id: phone_id,
        name: phone_id,
        avatar: `https://d2u8k2ocievbld.cloudfront.net/memojis/female/${idx + 1}.png`,
        secondary: phone_id,
      }
    });

    return contactsParsed;
  }

  static async insertOne() {
  }

  static async updateOne() {
  }

  static async deleteOne() {
  }
}