import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  // Esto evita que TypeScript se queje de la propiedad global
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const URI = process.env.MONGODB_URI;

if (!URI) {
  throw new Error('Missing MONGODB_URI in environment variables');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, utiliza una variable global
  if (!global._mongoClientPromise) {
    client = new MongoClient(URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crea una instancia de cliente única
  client = new MongoClient(URI);
  clientPromise = client.connect();
}

export default clientPromise;
