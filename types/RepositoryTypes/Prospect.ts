import { z } from "zod";

// Cost concept types
export const CostConceptModel = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del concepto es requerido"),
  type: z.enum(["percentage", "fixed", "per_unit"], {
    required_error: "El tipo de concepto es requerido",
  }),
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  appliesTo: z.enum(["thread", "all_costs"]).optional(),
  quantity: z.number().optional(), // For per_unit type
});

export type CostConcept = z.infer<typeof CostConceptModel>;

// Individual concept cost calculation result
export const ConceptCostModel = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  amount: z.number(),
});

export type ConceptCost = z.infer<typeof ConceptCostModel>;

// Calculated costs for a sweater
export const CalculatedCostsModel = z.object({
  threadCost: z.number(),
  conceptCosts: z.array(ConceptCostModel),
  totalCost: z.number(),
});

export type CalculatedCosts = z.infer<typeof CalculatedCostsModel>;

// Sweater within a prospect
export const ProspectSweaterModel = z.object({
  id: z.string(),
  productId: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().min(1, "El color es requerido"),
  size: z.string().min(1, "La talla es requerida"),
  sweaterWeightGr: z.number().min(0, "El peso debe ser mayor o igual a 0"),
  wasteGr: z.number().min(0, "El desperdicio debe ser mayor o igual a 0"),
  quantity: z.number().min(1, "La cantidad debe ser mayor o igual a 1").default(1),
  calculatedCosts: CalculatedCostsModel.optional(),
});

export type ProspectSweater = z.infer<typeof ProspectSweaterModel>;

// Prospect settings
export const ProspectSettingsModel = z.object({
  threadPricePerKg: z.number().min(0, "El precio del hilo es requerido"),
});

export type ProspectSettings = z.infer<typeof ProspectSettingsModel>;

// Main Prospect model
export const ProspectModel = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre del prospecto es requerido"),
  costConcepts: z.array(CostConceptModel),
  settings: ProspectSettingsModel,
  sweaters: z.array(ProspectSweaterModel),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional(),
});

export type Prospect = z.infer<typeof ProspectModel>;

// Input models
export const ProspectInputModel = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "El nombre del prospecto es requerido"),
  costConcepts: z.array(CostConceptModel),
  settings: ProspectSettingsModel,
  sweaters: z.array(ProspectSweaterModel),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type ProspectInput = z.infer<typeof ProspectInputModel>;

// Filter model
export const ProspectRepositoryFilterModel = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

export type ProspectRepositoryFilter = z.infer<
  typeof ProspectRepositoryFilterModel
>;
