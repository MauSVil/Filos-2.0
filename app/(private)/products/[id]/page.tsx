'use client';

import { useParams } from "next/navigation";
import { useProduct } from "../_hooks/useProduct";
import { Form } from "@/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, ProductModel } from "@/types/RepositoryTypes/Product";
import { InputFormField } from "@/components/form/InputFormField";
import { useEffect, useState } from "react";
import { ComboboxFormField } from "@/components/form/ComboboxField";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";

const defaultValues: Product = {
  baseId: "",
  uniqId: "",
  color: "",
  name: "",
  webPagePrice: 0,
  wholesalePrice: 0,
  retailPrice: 0,
  specialPrice: 0,
  quantity: 0,
  size: "",
  deleted_at: null,
  image: "",
  updated_at: new Date(),
};

const ProductIdPage = () => {
  const [file, setFile] = useState<string>();
  const params = useParams();
  const id = params.id;
  const { productQuery } = useProduct(id as string);

  const form = useForm<Product>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(ProductModel),
  });

  const { control, watch } = form;

  const uniqId = watch('uniqId');

  useEffect(() => {
    if (productQuery.data?.data && productQuery.data?.data.length > 0) {
      form.reset({
        name: productQuery.data.data[0].name,
        baseId: productQuery.data.data[0].baseId,
        uniqId: productQuery.data.data[0].uniqId,
        color: productQuery.data.data[0].color,
        webPagePrice: productQuery.data.data[0].webPagePrice,
        wholesalePrice: productQuery.data.data[0].wholesalePrice,
        retailPrice: productQuery.data.data[0].retailPrice,
        specialPrice: productQuery.data.data[0].specialPrice,
        quantity: productQuery.data.data[0].quantity,
        size: productQuery.data.data[0].size,
      })

      setFile(productQuery.data.data[0].image);
    }
  }, [productQuery.data]);

  const debouncedUniqId = useDebounce(uniqId, 500);

  useEffect(() => {
    if (debouncedUniqId) {
      const baseId = debouncedUniqId.slice(0, 6);
      form.setValue('baseId', baseId);
    }
  }, [debouncedUniqId]);

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log(data);
  });

  const image = watch('image');

  return (
    <Form {...form}>
      <div className="flex gap-4">
        <div className="flex w-3/4 flex-col gap-4">
          <InputFormField
            controllerProps={{
              control,
              name: "name",
            }}
            name="name"
            label="Nombre"
            disabled={productQuery.isLoading}
          />
          <div className="flex gap-4">
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "uniqId",
              }}
              name="uniqId"
              label="Id único"
              disabled={productQuery.isLoading}
            />
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "baseId",
              }}
              name="baseId"
              label="Id base"
              disabled
            />
          </div>
          <InputFormField
            controllerProps={{
              control,
              name: "color",
            }}
            name="color"
            label="Color"
            disabled={productQuery.isLoading}
          />
          <ComboboxFormField
            items={[
              { label: 'Unitalla', value: 'UNI' }
            ]}
            controllerProps={{
              control,
              name: 'size'
            }}
            label='Talla'
            placeholder='Selecciona una talla...'
            searchLabel='Buscar una talla...'
            emptyLabel="No hay tallas"
          />
          <div className="flex gap-4">
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "webPagePrice",
              }}
              name="webPagePrice"
              label="Precio de página web"
              type="number"
              disabled={productQuery.isLoading}
              valueModifierOnChange={value => Number(value)}
            />
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "wholesalePrice",
              }}
              labelClassName="text-green-500"
              name="wholesalePrice"
              label="Precio de mayoreo"
              type="number"
              disabled={productQuery.isLoading}
              valueModifierOnChange={value => Number(value)}
            />
          </div>
          <div className="flex gap-4">
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "retailPrice",
              }}
              name="retailPrice"
              label="Precio de menudeo"
              type="number"
              disabled={productQuery.isLoading}
              valueModifierOnChange={value => Number(value)}
            />
            <InputFormField
              className="flex-1"
              controllerProps={{
                control,
                name: "specialPrice",
              }}
              name="specialPrice"
              label="Precio especial"
              type="number"
              disabled={productQuery.isLoading}
              valueModifierOnChange={value => Number(value)}
            />
          </div>

          <InputFormField
            controllerProps={{
              control,
              name: "quantity",
            }}
            name="quantity"
            label="Cantidad"
            type="number"
            disabled={productQuery.isLoading}
            valueModifierOnChange={value => Number(value)}
          />
        </div>
        <div className="flex-col gap-4 w-1/4">
          <InputFormField
            controllerProps={{
              control,
              name: "image",
            }}
            name="image"
            label="Imagen"
            disabled={productQuery.isLoading}
            type="file"
            className="mb-4"
          />
          {
            file && !image && (
              <div className="flex flex-col items-center gap-4 relative">
                <img src={file} alt="Imagen del producto" className="w-full max-h-96 object-contain" />
              </div>
            )
          }
          {
            image && (
              <div className="flex flex-col items-center gap-4 relative">
                <img src={URL.createObjectURL(image as File)} alt="Imagen del producto" className="w-full object-cover" />
              </div>
            )
          }
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={productQuery.isLoading} className="mt-4">
        Guardar
      </Button>
    </Form>
  );
};

export default ProductIdPage;