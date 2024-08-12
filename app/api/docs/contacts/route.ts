import clientPromise from '@/mongodb';
import * as ExcelJS from 'exceljs';
import { Db } from 'mongodb';
import { NextResponse } from "next/server";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

const excelTitles: { [key: string]: string } = {
  'Nombre': 'fullName',
  'Telefono': 'phone_id',
  // 'Correo': 'email',
  'Direccion': 'address',
  // 'Etiqueta': 'tag',
}

export const POST = async (req: Request) => {
  try {
    await init();
    const formData = await req.formData();
    const file = formData.get('file') as File | undefined;
    if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('Worksheet not found');
    const contacts: { [key: string]: any } = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const employee: { [key: string]: any } = {};
      row.eachCell((cell, cellNumber) => {
        const title = worksheet.getCell(1, cellNumber).value as string;
        const key = excelTitles[title];
        if (key) {
          employee[key] = cell.text.trim();
        }
      });

      employee.aiEnabled = true;
      employee.newMessage = false;

      contacts.push(employee);
    });

    const parsedContacts = contacts as any[];

    await db.collection('whatsapp-contacts').insertMany(parsedContacts);

    return NextResponse.json({ message: 'File uploaded successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}