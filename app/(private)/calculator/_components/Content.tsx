"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CostItem, CalculationResult } from "@/types/Calculator";

const Content = () => {
  const [primaryMaterialPrice, setPrimaryMaterialPrice] = useState<string>("");
  const [materialWeight, setMaterialWeight] = useState<string>("");
  const [numberOfSweaters, setNumberOfSweaters] = useState<string>("");
  const [additionalCosts, setAdditionalCosts] = useState<CostItem[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const addCostItem = () => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      name: "",
      cost: 0,
    };
    setAdditionalCosts([...additionalCosts, newItem]);
  };

  const removeCostItem = (id: string) => {
    setAdditionalCosts(additionalCosts.filter((item) => item.id !== id));
  };

  const updateCostItem = (id: string, field: keyof CostItem, value: string | number) => {
    setAdditionalCosts(
      additionalCosts.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateCosts = () => {
    const pricePerKg = parseFloat(primaryMaterialPrice) || 0;
    const weight = parseFloat(materialWeight) || 0;
    const sweaters = parseInt(numberOfSweaters) || 0;

    if (sweaters === 0) return;

    const totalMaterialCost = pricePerKg * weight;
    const totalAdditionalCosts = additionalCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalCost = totalMaterialCost + totalAdditionalCosts;
    const costPerSweater = totalCost / sweaters;

    setResult({
      totalMaterialCost,
      totalAdditionalCosts,
      totalCost,
      costPerSweater,
      breakdown: {
        materialCost: totalMaterialCost,
        additionalCosts: additionalCosts,
      },
    });
  };

  const reset = () => {
    setPrimaryMaterialPrice("");
    setMaterialWeight("");
    setNumberOfSweaters("");
    setAdditionalCosts([]);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Material Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Material</CardTitle>
            <CardDescription>Ingresa los datos del material principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Precio por kg ($)</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={primaryMaterialPrice}
                  onChange={(e) => setPrimaryMaterialPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso por suéter (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={materialWeight}
                  onChange={(e) => setMaterialWeight(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sweaters">Cantidad de suéteres</Label>
              <Input
                id="sweaters"
                type="number"
                placeholder="0"
                value={numberOfSweaters}
                onChange={(e) => setNumberOfSweaters(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Costs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Costos Adicionales</CardTitle>
                <CardDescription>Agrega costos de logística, accesorios, etc.</CardDescription>
              </div>
              <Button onClick={addCostItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {additionalCosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay costos adicionales. Haz clic en "Agregar" para añadir uno.
              </p>
            ) : (
              <div className="space-y-3">
                {additionalCosts.map((item) => (
                  <div key={item.id} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Concepto</Label>
                      <Input
                        placeholder="Ej: Logística, Botones, etc."
                        value={item.name}
                        onChange={(e) => updateCostItem(item.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Costo ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.cost || ""}
                        onChange={(e) =>
                          updateCostItem(item.id, "cost", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCostItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={calculateCosts} className="flex-1">
            Calcular
          </Button>
          <Button onClick={reset} variant="outline">
            Limpiar
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Resumen de costos calculados</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Cost per Sweater - Highlighted */}
                <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Costo por suéter</p>
                  <p className="text-3xl font-bold text-blue-400">
                    ${result.costPerSweater.toFixed(2)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400">Material principal</span>
                    <span className="font-semibold">
                      ${result.totalMaterialCost.toFixed(2)}
                    </span>
                  </div>

                  {result.breakdown.additionalCosts.length > 0 && (
                    <>
                      <div className="space-y-2">
                        {result.breakdown.additionalCosts.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{item.name || "Sin nombre"}</span>
                            <span className="text-gray-300">${item.cost.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                        <span className="text-sm text-gray-400">Subtotal adicionales</span>
                        <span className="font-semibold">
                          ${result.totalAdditionalCosts.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-700">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">${result.totalCost.toFixed(2)}</span>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2">
                    Para {numberOfSweaters} suéter{parseInt(numberOfSweaters) !== 1 ? "es" : ""}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Completa los campos y haz clic en "Calcular" para ver los resultados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Content;