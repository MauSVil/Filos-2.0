import { ObjectId } from "mongodb";
import { z } from "zod";

export const UserModel = z.object({
  _id: z.string(),
  name: z.string(),
  firstLastName: z.string(),
  secondLastName: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string(),
});

export type User = z.infer<typeof UserModel>;

export const UserRepositoryFilterModel = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
});

export type UserRepositoryFilter = z.infer<typeof UserRepositoryFilterModel>;

export const MongoUserModel = z.object({
  _id: z.instanceof(ObjectId).optional(),
  email: z.string(),
  name: z.string(),
  firstLastName: z.string(),
  secondLastName: z.string(),
  password: z.string(),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type MongoUser = z.infer<typeof MongoUserModel>;
