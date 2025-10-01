import { z } from "zod";

export const CostItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  cost: z.number().min(0, "Cost must be positive"),
});

export const CalculatorInputSchema = z.object({
  primaryMaterialPricePerKg: z.number().min(0, "Price must be positive"),
  materialWeightPerSweater: z.number().min(0, "Weight must be positive"),
  numberOfSweaters: z.number().int().min(1, "Must produce at least 1 sweater"),
  additionalCosts: z.array(CostItemSchema),
});

export type CostItem = z.infer<typeof CostItemSchema>;
export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;

export interface CalculationResult {
  totalMaterialCost: number;
  totalAdditionalCosts: number;
  totalCost: number;
  costPerSweater: number;
  breakdown: {
    materialCost: number;
    additionalCosts: CostItem[];
  };
}