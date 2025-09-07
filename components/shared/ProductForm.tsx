"use client";

import { UseFormReturn } from "react-hook-form";
import { Package, DollarSign, Image as ImageIcon, Tag, Palette } from "lucide-react";

import { InputFormField } from "../form/InputFormField";
import { ComboboxFormField } from "../form/ComboboxField";
import { Form } from "../form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

import { ProductInputClient } from "@/types/RepositoryTypes/Product.client";

interface Props {
  form: UseFormReturn<ProductInputClient>;
  isLoading: boolean;
  submit: () => void;
  onCancel?: () => void;
  image?: File;
  file?: string;
}

const ProductForm = ({ form, isLoading, submit, onCancel, image, file }: Props) => {
  const { control, watch } = form;
  const specialPrice = watch("specialPrice");
  const retailPrice = watch("retailPrice");
  const wholesalePrice = watch("wholesalePrice");
  const webPagePrice = watch("webPagePrice");

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputFormField
                controllerProps={{
                  control,
                  name: "name",
                }}
                disabled={isLoading}
                label="Nombre del Producto"
                name="name"
                placeholder="Ingresa el nombre del producto"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputFormField
                  controllerProps={{
                    control,
                    name: "uniqId",
                  }}
                  disabled={isLoading}
                  label="ID Único"
                  name="uniqId"
                  placeholder="Ej: ABC123"
                />
                <InputFormField
                  disabled
                  controllerProps={{
                    control,
                    name: "baseId",
                  }}
                  label="ID Base"
                  name="baseId"
                  placeholder="Generado automáticamente"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputFormField
                  controllerProps={{
                    control,
                    name: "color",
                  }}
                  disabled={isLoading}
                  label="Color"
                  name="color"
                  placeholder="Ej: Rojo, Azul, Verde"
                />
                <ComboboxFormField
                  controllerProps={{
                    control,
                    name: "size",
                  }}
                  emptyLabel="No hay tallas disponibles"
                  items={[
                    { label: "Unitalla", value: "UNI" },
                    { label: "Chica", value: "Chica" },
                    { label: "Mediana", value: "Mediana" },
                    { label: "Grande", value: "Grande" },
                    { label: "EG", value: "EG" },
                    { label: "2 EG", value: "2EG" },
                    { label: "3 EG", value: "3EG" },
                    { label: "Extra Grande", value: "Extra Grande" },
                    { label: "Niño Talla 4", value: "Niño Talla 4" },
                    { label: "Niño Talla 6", value: "Niño Talla 6" },
                    { label: "Niño Talla 8", value: "Niño Talla 8" },
                    { label: "Niño Talla 10", value: "Niño Talla 10" },
                  ]}
                  label="Talla"
                  placeholder="Selecciona una talla..."
                  searchLabel="Buscar talla..."
                />
              </div>

              <InputFormField
                controllerProps={{
                  control,
                  name: "quantity",
                }}
                disabled={isLoading}
                label="Cantidad en Stock"
                name="quantity"
                type="number"
                min="0"
                placeholder="0"
                valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
              />
            </CardContent>
          </Card>

          {/* Pricing Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <InputFormField
                    controllerProps={{
                      control,
                      name: "specialPrice",
                    }}
                    disabled={isLoading}
                    label="Precio Especial"
                    labelClassName="text-green-400 font-medium"
                    name="specialPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
                  />
                  <p className="text-xs text-gray-400">Precio base para cálculos automáticos</p>
                </div>
                
                <div className="space-y-2">
                  <InputFormField
                    controllerProps={{
                      control,
                      name: "wholesalePrice",
                    }}
                    disabled={isLoading}
                    label="Precio Mayoreo"
                    labelClassName="text-purple-400 font-medium"
                    name="wholesalePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
                  />
                  {specialPrice > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +$40 del precio especial
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <InputFormField
                    controllerProps={{
                      control,
                      name: "retailPrice",
                    }}
                    disabled={isLoading}
                    label="Precio Semi-mayoreo"
                    labelClassName="text-yellow-400 font-medium"
                    name="retailPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
                  />
                  {specialPrice > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +$50 del precio especial
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <InputFormField
                    controllerProps={{
                      control,
                      name: "webPagePrice",
                    }}
                    disabled={isLoading}
                    label="Precio Página Web"
                    labelClassName="text-red-400 font-medium"
                    name="webPagePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
                  />
                  <p className="text-xs text-gray-400">Precio público en línea</p>
                </div>
              </div>

              {(specialPrice > 0 || retailPrice > 0 || wholesalePrice > 0 || webPagePrice > 0) && (
                <>
                  <Separator />
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-100">Resumen de Precios</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {specialPrice > 0 && (
                        <div className="text-green-400">
                          <span className="block font-medium">Especial</span>
                          <span>${specialPrice}</span>
                        </div>
                      )}
                      {wholesalePrice > 0 && (
                        <div className="text-purple-400">
                          <span className="block font-medium">Mayoreo</span>
                          <span>${wholesalePrice}</span>
                        </div>
                      )}
                      {retailPrice > 0 && (
                        <div className="text-yellow-400">
                          <span className="block font-medium">Semi-mayoreo</span>
                          <span>${retailPrice}</span>
                        </div>
                      )}
                      {webPagePrice > 0 && (
                        <div className="text-red-400">
                          <span className="block font-medium">Web</span>
                          <span>${webPagePrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Image Upload Card */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-400" />
                Imagen del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputFormField
                controllerProps={{
                  control,
                  name: "image",
                }}
                disabled={isLoading}
                label="Seleccionar Imagen"
                name="image"
                type="file"
                accept="image/*"
              />
              
              {(file || image) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="aspect-square relative bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-700">
                    <img
                      alt="Vista previa del producto"
                      className="w-full h-full object-cover"
                      src={image ? URL.createObjectURL(image) : file}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Vista previa</p>
                    <p className="text-xs text-gray-500">
                      {image ? image.name : "Imagen actual"}
                    </p>
                  </div>
                </div>
              )}
              
              {!file && !image && (
                <div className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p className="text-sm text-center">
                    No hay imagen seleccionada
                  </p>
                  <p className="text-xs text-center mt-1">
                    Selecciona una imagen para ver la vista previa
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
        <Button 
          variant="outline" 
          disabled={isLoading}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          onClick={submit} 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "Guardando..." : "Guardar Producto"}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;
