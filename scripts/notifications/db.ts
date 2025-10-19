/**
 * Database helper para scripts
 */

import clientPromise from "@/mongodb";
import { Db } from "mongodb";

let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB_NAME || "test";
  cachedDb = client.db(dbName);

  return cachedDb;
}
