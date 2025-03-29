import { Db, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";

import clientPromise from "@/mongodb";

export const GET = async (req: NextRequest) => {
  try {
    const client = await clientPromise;
    const db = client.db("test") as Db;

    const whatsappMessagesCollection = await db.collection("whatsapp-messages");
    const whatsappContactsCollection = await db.collection("whatsapp-contacts");

    const whatsappMessages = await whatsappMessagesCollection
      .find({})
      .toArray();
    const groupedMessages = _.groupBy(whatsappMessages, "phone_id");

    const contactsToDelete = [];
    const messagesToDelete = [];

    for (const phoneId in groupedMessages) {
      const messages = groupedMessages[phoneId];

      if (messages.length === 2) {
        for (const message of messages) {
          messagesToDelete.push(new ObjectId(message._id));
        }
        contactsToDelete.push(phoneId);
      }
    }

    // await whatsappContactsCollection.deleteMany({
    //   phone_id: {
    //     $in: contactsToDelete.map(contact => contact.toString())
    //   }
    // });

    // await whatsappMessagesCollection.deleteMany({
    //   _id: {
    //     $in: messagesToDelete
    //   }
    // });

    return NextResponse.json({ contactsToDelete, messagesToDelete });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
