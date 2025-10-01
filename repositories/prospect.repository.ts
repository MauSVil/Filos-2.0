import { Db, ObjectId } from "mongodb";

import {
  Prospect,
  ProspectInput,
  ProspectInputModel,
  ProspectRepositoryFilter,
  ProspectRepositoryFilterModel,
  ProspectSweater,
  CostConcept,
  CalculatedCosts,
  ConceptCost,
} from "@/types/RepositoryTypes/Prospect";
import clientPromise from "@/mongodb";

let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};

export class ProspectRepository {
  /**
   * Calculate costs for a single sweater
   */
  static calculateSweaterCosts(
    sweater: ProspectSweater,
    costConcepts: CostConcept[],
    threadPricePerKg: number,
  ): CalculatedCosts {
    // 1. Thread Cost = ((weight + waste) / 1000) × threadPrice × quantity
    const threadCostPerUnit =
      ((sweater.sweaterWeightGr + sweater.wasteGr) / 1000) * threadPricePerKg;
    const threadCost = threadCostPerUnit * sweater.quantity;

    // 2. Calculate each cost concept (fixed amounts, not multiplied by sweater quantity)
    const conceptCosts: ConceptCost[] = [];
    let runningTotal = threadCost;

    for (const concept of costConcepts) {
      let amount = 0;

      switch (concept.type) {
        case "fixed":
          amount = concept.value;
          break;

        case "per_unit":
          amount = concept.value * (concept.quantity || 1);
          break;

        case "percentage":
          if (concept.appliesTo === "thread") {
            amount = threadCost * (concept.value / 100);
          } else if (concept.appliesTo === "all_costs") {
            amount = runningTotal * (concept.value / 100);
          }
          break;
      }

      conceptCosts.push({
        conceptId: concept.id,
        conceptName: concept.name,
        amount,
      });

      runningTotal += amount;
    }

    // 3. Total Cost = (thread × quantity) + sum of all concepts
    const totalCost = runningTotal;

    return {
      threadCost,
      conceptCosts,
      totalCost,
    };
  }

  /**
   * Recalculate all costs for a prospect
   */
  static recalculateProspect(prospect: Prospect): Prospect {
    const updatedSweaters = prospect.sweaters.map((sweater) => ({
      ...sweater,
      calculatedCosts: this.calculateSweaterCosts(
        sweater,
        prospect.costConcepts,
        prospect.settings.threadPricePerKg,
      ),
    }));

    return {
      ...prospect,
      sweaters: updatedSweaters,
      updated_at: new Date(),
    };
  }

  static async findOne(
    filter: ProspectRepositoryFilter = {},
  ): Promise<Prospect | null> {
    await init();
    const filters = await ProspectRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;

    const prospect = await db.collection("prospects").findOne<Prospect>({
      ...rest,
      ...(id ? { _id: new ObjectId(id) } : {}),
    });

    return prospect;
  }

  static async find(
    filter: ProspectRepositoryFilter = {},
  ): Promise<Prospect[]> {
    await init();
    const filters = await ProspectRepositoryFilterModel.parse(filter);
    const { id, ...rest } = filters;

    const query: any = { ...rest };

    if (id) {
      query._id = new ObjectId(id);
    }

    const prospects = await db
      .collection("prospects")
      .find<Prospect>(query)
      .sort({ created_at: -1 })
      .toArray();

    return prospects;
  }

  static async create(input: ProspectInput): Promise<Prospect> {
    await init();
    const data = await ProspectInputModel.parse(input);
    const now = new Date();

    // Calculate costs for all sweaters
    const sweatersWithCosts = data.sweaters.map((sweater) => ({
      ...sweater,
      calculatedCosts: this.calculateSweaterCosts(
        sweater,
        data.costConcepts,
        data.settings.threadPricePerKg,
      ),
    }));

    const { _id, ...prospectData } = data;

    const prospect = {
      ...prospectData,
      sweaters: sweatersWithCosts,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection("prospects").insertOne(prospect);

    return {
      ...prospect,
      _id: result.insertedId.toString(),
    } as Prospect;
  }

  static async update(
    id: string,
    input: Partial<ProspectInput>,
  ): Promise<Prospect | null> {
    await init();
    const data = await ProspectInputModel.partial().parse(input);

    // If updating sweaters, concepts, or settings, recalculate costs
    let updateData: any = {
      ...data,
      updated_at: new Date(),
    };

    // Fetch current prospect to recalculate if needed
    const currentProspect = await this.findOne({ id });
    if (currentProspect && (data.sweaters || data.costConcepts || data.settings)) {
      const prospectToRecalc = {
        ...currentProspect,
        ...data,
      } as Prospect;

      const recalculated = this.recalculateProspect(prospectToRecalc);
      updateData.sweaters = recalculated.sweaters;
    }

    const result = await db.collection("prospects").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    );

    return result as Prospect | null;
  }

  static async delete(id: string): Promise<boolean> {
    await init();
    const result = await db
      .collection("prospects")
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  }

  /**
   * Recalculate costs for a specific prospect
   */
  static async recalculateById(id: string): Promise<Prospect | null> {
    const prospect = await this.findOne({ id });
    if (!prospect) return null;

    const recalculated = this.recalculateProspect(prospect);

    await db.collection("prospects").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          sweaters: recalculated.sweaters,
          updated_at: recalculated.updated_at,
        },
      },
    );

    return recalculated;
  }
}
