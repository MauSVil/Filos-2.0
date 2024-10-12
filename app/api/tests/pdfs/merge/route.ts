import { ProductsRepository } from "@/repositories/products.repository";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from 'pdf-lib';

const fetchImage = async (url: string) => {
  const response = await ky.get(url);
  return await response.arrayBuffer();
}

const convertImageToPdf = async (imageBytes: Uint8Array) => {
  const pdfDoc = await PDFDocument.create();
  const image = await pdfDoc.embedPng(imageBytes);
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  page.drawText('Imagen de producto', {
    x: 20,  // Ajusta la posición horizontal del texto
    y: image.height - 30,  // Colocar el texto cerca de la parte superior de la imagen
    size: 24,  // Tamaño del texto reducido
    color: rgb(0, 0, 0),  // Texto en negro
  });

  return pdfDoc.save();
}

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