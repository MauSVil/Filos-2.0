/**
 * Database helper para scripts
 */

import clientPromise from "@/mongodb";
import { Db, MongoClient } from "mongodb";

let cachedDb: Db | null = null;
let cachedClient: MongoClient | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await clientPromise;
  cachedClient = client;
  const dbName = process.env.MONGODB_DB_NAME || "test";
  cachedDb = client.db(dbName);

  return cachedDb;
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
