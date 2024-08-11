import { NextResponse } from "next/server"
import * as ExcelJS from "exceljs";
import Contacts from "@/app/(private)/chat/_components/Contacts";
import { Contact } from "@/app/(private)/chat/page";

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | undefined;
    if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) return NextResponse.json({ message: 'Worksheet not found' }, { status: 400 });

    console.log('worksheet', worksheet);

    // const worksheet = workbook.worksheets[0];
    // const rows: any[] = []

    // worksheet.eachRow((row, rowNumber) => {
    //   const rowValues: any[] = [];
    //   console.log(row, rowNumber, '***********************');
    //   // row.eachCell((cell) => {
    //   //   rowValues.push(cell.value);
    //   // });
    //   rows.push(rowValues);
    // });

    return NextResponse.json({ message: "File uploaded" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}