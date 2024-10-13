import clientPromise from "@/mongodb";
import { Catalog } from "@/types/MongoTypes/Catalog";
import { CatalogInput, CatalogInputModel, CatalogRepositoryFilter, CatalogRepositoryFilterModel } from "@/types/RepositoryTypes/Catalog";
import _ from "lodash";
import { Db, ObjectId } from "mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db('test') as Db;
};

export class CatalogsRepository {
  static async findOne(filter: CatalogRepositoryFilter = {}): Promise<Catalog | null> {
    await init();
    const filters = await CatalogRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;
    const catalog = await db.collection('catalogs').findOne<Catalog>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });
    return catalog;
  }

  static async find(filter: CatalogRepositoryFilter = {}): Promise<Catalog[]> {
    await init();
    const filters = await CatalogRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;

    const catalogs = await db.collection('catalogs').find<Catalog>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    }).toArray();
    return catalogs;
  }

  static async count(filter: CatalogRepositoryFilter = {}): Promise<number> {
    await init();
    const filters = await CatalogRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;

    const count = await db.collection('catalogs').countDocuments({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });
    return count;
  }

  static async insertOne(input: CatalogInput) {
    await init();
    const inputParsed = await CatalogInputModel.parse(input);
    inputParsed.createdAt = new Date();

    await db.collection('catalogs').insertOne(input);
    return 'Catalog inserted';
  }
}