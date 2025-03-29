import * as XLSX from "xlsx";
import { Db } from "mongodb";
import { NextResponse } from "next/server";
import moment from "moment-timezone";

import clientPromise from "@/mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

const excelTitles: { [key: string]: string } = {
  "Nombre ": "fullName",
  Teléfono: "phone_id",
  Correo: "email",
  ESTADO: "address",
  // 'Etiqueta': 'tag',
};

function toProperCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export const POST = async (req: Request) => {
  try {
    await init();
    const formData = await req.formData();
    const file = formData.get("file") as any;

    if (!file)
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 },
      );
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const contacts = data
      .map((contact: any) => {
        const newContact: any = {
          aiEnabled: true,
          lastMessageSent: moment().tz("America/Mexico_City").toDate(),
        };

        for (const key in contact) {
          const title = excelTitles[key];

          switch (title) {
            case "fullName":
              newContact[title] = toProperCase(contact[key]);
              break;
            case "phone_id":
              newContact[title] = (contact[key] || "")
                .toString()
                .replace(/\D/g, "");
              break;
            case "email":
              newContact[title] = contact[key];
              break;
            case "address":
              newContact[title] = contact[key];
              break;
            default:
              break;
          }
        }

        return newContact;
      })
      .filter((contact) => contact.phone_id);

    await db.collection("whatsapp-contacts").deleteMany({});
    await db.collection("whatsapp-contacts").insertMany(contacts);

    return NextResponse.json({ message: "File uploaded successfully" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
};
