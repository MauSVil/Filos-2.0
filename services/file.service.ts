import { Client } from 'minio';
import JSZip from 'jszip';

export class FileService {
  private static minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: 443,
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
  });

  static async uploadFile(bucketName: string, objectName: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }

    // Check if the file already exists
    try {
      await this.minioClient.statObject(bucketName, objectName);
      console.log(`File ${objectName} already exists in bucket ${bucketName}.`);
      return `https://minio.mausvil.dev/${bucketName}/${objectName}`;
    } catch (err) {
      console.log(`File ${objectName} does not exist in bucket ${bucketName}. Proceeding to upload.`);
    }

    await this.minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType,
    });

    return `https://minio.mausvil.dev/${bucketName}/${objectName}`;
  }

  static async getFiles(bucketName: string): Promise<string[]> {
    const objects = await this.minioClient.listObjects(bucketName, '', true);
    const files: string[] = [];

    for await (const obj of objects) {
      files.push(`https://minio.mausvil.dev/${bucketName}/${obj.name}`);
    }

    return files;
  }

  static async createZipFromDocuments(
    documents: { name: string, buffer: Buffer }[],
    getPath?: (doc: { name: string, buffer: Buffer }) => string
  ): Promise<Buffer> {
    const zip = new JSZip();
  
    documents.forEach((doc) => {
      const path = getPath ? getPath(doc) : "";
      const fullPath = path ? `${path}/${doc.name}` : doc.name;
      zip.file(fullPath, doc.buffer);
    });
  
    console.log("Starting to generate ZIP...");
  
    const zipContent = await zip.generateAsync(
      { type: "nodebuffer" },
      (metadata) => {
        console.log(`Progress: ${metadata.percent.toFixed(2)}%`);
      }
    );
  
    console.log("ZIP generation completed");
  
    return zipContent;
  }
}