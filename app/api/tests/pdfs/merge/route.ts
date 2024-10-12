import { ProductsRepository } from "@/repositories/products.repository";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const fetchImage = async (url: string) => {
  const response = await ky.get(url);
  return await response.arrayBuffer();
}

const convertImageToPdf = async (imageBytes: Uint8Array) => {
  const pdfDoc = await PDFDocument.create();
  const image = await pdfDoc.embedPng(imageBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const page = pdfDoc.addPage([image.width, image.height]);
  
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const text = 'M-3031-U-GB';
  const textSize = 24;
  const textX = image.width - helveticaFont.widthOfTextAtSize(text, textSize) - 20;
  const textY = 30;

  const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
  const textHeight = textSize + 10;

  page.drawRectangle({
    x: textX - 5,
    y: textY - textHeight + 25,
    width: textWidth + 10,
    height: textHeight,
    color: rgb(1, 1, 1)
  });

  page.drawText(text, {
    x: textX,
    y: textY,
    size: textSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  return pdfDoc.save();
};

const mergePdfs = async (pdfUrls: string[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  
  for (const url of pdfUrls) {
    const imageBytes = await fetchImage(url);
    const imagePdfBytes = await convertImageToPdf(new Uint8Array(imageBytes));
    
    const imagePdfDoc = await PDFDocument.load(imagePdfBytes);
    const copiedPages = await pdfDoc.copyPages(imagePdfDoc, imagePdfDoc.getPageIndices());
    
    copiedPages.forEach((page) => {
      pdfDoc.addPage(page);
    });
  }

  return pdfDoc.save();
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { pdfIds } = body;

    const products = await ProductsRepository.find({ ids: pdfIds });

    if (!products.length) {
      return NextResponse.json({ error: 'No se encontraron productos' }, { status: 404 });
    }

    const pdfs = products.map((product) => {
      return product.image;
    });

    const mergedPdf = await mergePdfs(pdfs);

    return new NextResponse(mergedPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}