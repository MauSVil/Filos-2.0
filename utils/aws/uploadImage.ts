import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.S3ACCESSID!,
    secretAccessKey: process.env.S3SECRETACCESSKEY!,
  },
  region: "us-west-1",
});

export const uploadImage = async (originalname: string, buffer: Buffer) => {
  const uploadResp = await new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3BUCKET,
      Key: originalname,
      Body: buffer,
    },
  });

  const resp = await uploadResp.done();
  const version = resp.VersionId;
  const url = `${resp.Location}?version=${version}`;

  return url;
};

export const updateFile = async (objectKey: string, buffer: Buffer) => {
  const params = {
    Bucket: process.env.S3BUCKET,
    Key: objectKey,
    Body: buffer,
  };
  const resp = await s3.putObject(params);

  return resp.VersionId;
};
