"use client";

import { UseFormReturn } from "react-hook-form";

import { InputFormField } from "../form/InputFormField";
import { ComboboxFormField } from "../form/ComboboxField";
import { Form } from "../form";
import { Button } from "../ui/button";

import { ProductInputClient } from "@/types/RepositoryTypes/Product.client";

interface Props {
  form: UseFormReturn<ProductInputClient>;
  isLoading: boolean;
  submit: () => void;
  image?: File;
  file?: string;
}

const ProductForm = ({ form, isLoading, submit, image, file }: Props) => {
  const { control } = form;

  return (
    <Form {...form}>
      <div className="flex gap-4">
        <div className="flex w-3/4 flex-col gap-4">
          <InputFormField
            controllerProps={{
              control,
              name: "name",
            }}
            disabled={isLoading}
            label="Nombre"
            name="name"
          />
          <div className="flex gap-4">
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "uniqId",
              }}
              disabled={isLoading}
              label="Id único"
              name="uniqId"
            />
            <InputFormField
              disabled
              className="flex-1"
              controllerProps={{
                control,
                name: "baseId",
              }}
              label="Id base"
              name="baseId"
            />
          </div>
          <InputFormField
            controllerProps={{
              control,
              name: "color",
            }}
            disabled={isLoading}
            label="Color"
            name="color"
          />
          <ComboboxFormField
            controllerProps={{
              control,
              name: "size",
            }}
            emptyLabel="No hay tallas"
            items={[{ label: "Unitalla", value: "UNI" }]}
            label="Talla"
            placeholder="Selecciona una talla..."
            searchLabel="Buscar una talla..."
          />

          <div className="flex gap-4">
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "specialPrice",
              }}
              disabled={isLoading}
              label="Precio especial"
              labelClassName="text-green-400"
              name="specialPrice"
              type="number"
              valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
            />
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "wholesalePrice",
              }}
              disabled={isLoading}
              label="Precio mayoreo"
              labelClassName="text-purple-400"
              name="wholesalePrice"
              type="number"
              valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
            />
          </div>

          <div className="flex gap-4">
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "retailPrice",
              }}
              disabled={isLoading}
              label="Precio semi-mayoreo"
              labelClassName="text-yellow-400"
              name="retailPrice"
              type="number"
              valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
            />

            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "webPagePrice",
              }}
              disabled={isLoading}
              label="Precio página web"
              labelClassName="text-red-400"
              name="webPagePrice"
              type="number"
              valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
            />
          </div>

          <InputFormField
            controllerProps={{
              control,
              name: "quantity",
            }}
            disabled={isLoading}
            label="Cantidad"
            name="quantity"
            type="number"
            valueModifierOnChange={(value) => value === "" ? 0 : Number(value)}
          />
        </div>
        <div className="flex-col gap-4 w-1/4">
          <InputFormField
            className="mb-4"
            controllerProps={{
              control,
              name: "image",
            }}
            disabled={isLoading}
            label="Imagen"
            name="image"
            type="file"
          />
          {file && !image && (
            <div className="flex flex-col items-center gap-4 relative">
              <img
                alt="Imagen del producto"
                className="w-full max-h-96 object-contain"
                src={file}
              />
            </div>
          )}
          {image && (
            <div className="flex flex-col items-center gap-4 relative">
              <img
                alt="Imagen del producto"
                className="w-full max-h-96 object-contain"
                src={URL.createObjectURL(image)}
              />
            </div>
          )}
        </div>
      </div>
      <Button className="mt-4" disabled={isLoading} onClick={submit}>
        Guardar
      </Button>
    </Form>
  );
};

export default ProductForm;
