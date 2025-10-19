"use client";

import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2, Calculator, Package, Settings as SettingsIcon, AlertTriangle, ExternalLink } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useMemo } from "react";
import Link from "next/link";

import { InputFormField } from "@/components/form/InputFormField";
import { Form } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormItem, FormLabel } from "@/components/ui/form";

import { ProspectInput } from "@/types/RepositoryTypes/Prospect";
import ProductSelector from "./ProductSelector";

interface Props {
  form: UseFormReturn<ProspectInput>;
  isLoading: boolean;
}

const ProspectForm = ({ form, isLoading }: Props) => {
  const { control } = form;

  const { fields: conceptFields, append: appendConcept, remove: removeConcept } = useFieldArray({
    control,
    name: "costConcepts",
  });

  const { fields: sweaterFields, append: appendSweater, remove: removeSweater } = useFieldArray({
    control,
    name: "sweaters",
  });

  // Watch values from form - no debouncing for immediate feedback
  const watchedSettings = useWatch({ control, name: "settings" });
  const watchedSweaters = useWatch({ control, name: "sweaters" }) || [];
  const watchedConcepts = useWatch({ control, name: "costConcepts" }) || [];

  // Pre-calculate thread costs for all sweaters to avoid recalculation in render
  const sweaterThreadCosts = useMemo((): (number | null)[] => {
    if (!watchedSettings?.threadPricePerKg) return [];

    return watchedSweaters.map(sweater => {
      if (!sweater || !sweater.sweaterWeightGr || !sweater.wasteGr || !sweater.quantity || sweater.quantity <= 0) {
        return null;
      }
      const threadCostPerUnit = ((sweater.sweaterWeightGr + sweater.wasteGr) / 1000) * watchedSettings.threadPricePerKg;
      return threadCostPerUnit * sweater.quantity;
    });
  }, [watchedSweaters, watchedSettings]);

  // Calculate total number of sweaters
  const totalSweaterQuantity = useMemo(() => {
    return watchedSweaters.reduce((sum, sweater) => {
      return sum + (sweater?.quantity || 0);
    }, 0);
  }, [watchedSweaters]);

  // Calculate total costs using pre-calculated thread costs
  const { totalThreadCost, conceptCosts, totalMinimumCost } = useMemo(() => {
    // 1. Sum thread costs
    const threadTotal: number = sweaterThreadCosts.reduce((sum: number, cost) => sum + (cost || 0), 0);

    // 2. Calculate concept costs
    const concepts: Array<{ name: string; amount: number; baseValue: number }> = [];
    let runningTotal: number = threadTotal;

    for (const concept of watchedConcepts) {
      if (!concept?.name?.trim()) continue;

      const value = concept.value || 0;
      let baseValue = 0;
      let amount = 0;

      switch (concept.type) {
        case "fixed":
          baseValue = value;
          amount = value * totalSweaterQuantity;
          break;
        case "per_unit":
          baseValue = value * (concept.quantity || 1);
          amount = baseValue * totalSweaterQuantity;
          break;
        case "percentage":
          amount = concept.appliesTo === "thread"
            ? threadTotal * (value / 100)
            : runningTotal * (value / 100);
          baseValue = amount / (totalSweaterQuantity || 1);
          break;
      }

      runningTotal += amount;
      concepts.push({ name: concept.name, amount, baseValue });
    }

    return {
      totalThreadCost: threadTotal as number,
      conceptCosts: concepts,
      totalMinimumCost: runningTotal as number
    };
  }, [sweaterThreadCosts, watchedConcepts, totalSweaterQuantity]);

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputFormField
                controllerProps={{ control, name: "name" }}
                disabled={isLoading}
                label="Nombre del Prospecto"
                name="name"
                placeholder="Ej: Análisis Primavera 2025"
              />
            </CardContent>
          </Card>

          {/* Sweaters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    Suéteres
                  </CardTitle>
                  <CardDescription>
                    Selecciona productos existentes para calcular sus costos
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    appendSweater({
                      id: uuidv4(),
                      name: "",
                      color: "",
                      size: "",
                      sweaterWeightGr: 0,
                      wasteGr: 0,
                      quantity: 1,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Suéter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sweaterFields.map((field, index) => {
                const threadCost = sweaterThreadCosts[index];
                const sweater = watchedSweaters[index];
                const productId = sweater?.productId;
                const hasMissingWeightOrWaste = sweater && productId && (sweater.sweaterWeightGr === 0 || sweater.wasteGr === 0);

                return (
                  <div key={field.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Suéter {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSweater(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <FormItem>
                            <FormLabel>Seleccionar Producto</FormLabel>
                            <ProductSelector
                              value={sweater?.productId}
                              onSelect={(product) => {
                                if (product) {
                                  form.setValue(`sweaters.${index}.productId`, product._id);
                                  form.setValue(`sweaters.${index}.name`, product.name);
                                  form.setValue(`sweaters.${index}.color`, product.color);
                                  form.setValue(`sweaters.${index}.size`, product.size);
                                  form.setValue(`sweaters.${index}.sweaterWeightGr`, product.sweaterWeight || 0);
                                  form.setValue(`sweaters.${index}.wasteGr`, product.sweaterWaste || 0);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <InputFormField
                          controllerProps={{ control, name: `sweaters.${index}.quantity` }}
                          label="Cantidad"
                          name={`sweaters.${index}.quantity`}
                          type="number"
                          min="1"
                          placeholder="1"
                          valueModifierOnChange={(value) => {
                            if (value === "") return "";
                            const num = Number(value);
                            return isNaN(num) ? "" : num;
                          }}
                          onBlur={(e: any) => {
                            const value = e.target.value;
                            if (!value || value === "" || value === "0" || Number(value) < 1) {
                              form.setValue(`sweaters.${index}.quantity`, 1);
                            }
                          }}
                        />
                      </div>

                      {hasMissingWeightOrWaste && productId && (
                        <Alert className="border-yellow-500/50 bg-yellow-500/10">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="flex items-center justify-between text-yellow-200">
                            <span>Este producto no tiene peso o desperdicio definido</span>
                            <Link href={`/products/${productId}`} target="_blank">
                              <Button variant="outline" size="sm" className="ml-2 border-yellow-500/50 hover:bg-yellow-500/20">
                                Editar Producto
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {threadCost !== null && threadCost > 0 && !hasMissingWeightOrWaste && sweater?.quantity && sweater.quantity > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Costo de hilo (x{sweater.quantity}):</span>
                          <span className="font-mono font-semibold">${threadCost.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {sweaterFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay suéteres agregados. Selecciona productos para comenzar.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Concepts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-gray-400" />
                    Conceptos de Costo
                  </CardTitle>
                  <CardDescription>
                    Define los conceptos que afectan el costo final
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    appendConcept({
                      id: uuidv4(),
                      name: "",
                      type: "fixed" as const,
                      value: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Concepto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {conceptFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Concepto {index + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConcept(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-end gap-3">
                      <InputFormField
                        controllerProps={{ control, name: `costConcepts.${index}.name` }}
                        label="Nombre"
                        name={`costConcepts.${index}.name`}
                        placeholder="Ej: Mano de obra"
                        className="flex-1"
                        debounceMs={300}
                      />
                      <InputFormField
                        controllerProps={{ control, name: `costConcepts.${index}.value` }}
                        label="Valor (MXN)"
                        name={`costConcepts.${index}.value`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        valueModifierOnChange={(value) => (value === "" ? 0 : Number(value))}
                        className="w-40"
                        debounceMs={300}
                      />
                    </div>
                    {totalSweaterQuantity > 0 && (
                      <p className="text-xs text-muted-foreground/60 text-right">
                        Este valor se multiplicará por {totalSweaterQuantity} suéteres
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {conceptFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay conceptos de costo. Agrega uno para comenzar.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-gray-400" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <InputFormField
                  controllerProps={{ control, name: "settings.threadPricePerKg" }}
                  disabled={true}
                  label="Precio Hilo por Kg (MXN)"
                  name="settings.threadPricePerKg"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  valueModifierOnChange={(value) => (value === "" ? 0 : Number(value))}
                />
                <p className="text-xs text-muted-foreground">
                  Este valor se obtiene automáticamente de la configuración general
                </p>
              </div>
            </CardContent>
          </Card>

          {sweaterFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-gray-400" />
                  Resumen de Costos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {sweaterFields.map((field, index) => {
                    const threadCost = sweaterThreadCosts[index];
                    const sweater = watchedSweaters[index];
                    const hasMissingData = !threadCost || (sweater && (sweater.sweaterWeightGr === 0 || sweater.wasteGr === 0));

                    if (hasMissingData) return null;

                    return (
                      <div key={field.id} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {sweater?.name || `Suéter ${index + 1}`} (x{sweater?.quantity || 1})
                        </span>
                        <span className="font-mono">${threadCost.toFixed(2)}</span>
                      </div>
                    );
                  })}

                  {totalThreadCost > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total Hilo:</span>
                        <span className="font-mono">${totalThreadCost.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {conceptCosts.length > 0 && (
                    <>
                      <Separator />
                      {conceptCosts.map((cc, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{cc.name}:</span>
                            <span className="font-mono">${cc.amount.toFixed(2)}</span>
                          </div>
                          {totalSweaterQuantity > 0 && (
                            <div className="flex justify-end text-xs text-muted-foreground/60">
                              ${cc.baseValue.toFixed(2)} x {totalSweaterQuantity} suéteres
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {totalMinimumCost > 0 && (
                  <>
                    <Separator />
                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-green-400">Costo Mínimo Total</span>
                        <span className="text-2xl font-bold text-green-400 font-mono">${totalMinimumCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Form>
  );
};

export default ProspectForm;
