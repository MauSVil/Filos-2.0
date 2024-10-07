import { ObjectId } from "mongodb";

export interface Buyer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}