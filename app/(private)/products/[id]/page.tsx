'use client';

import { Form } from "@/components/form";
import { InputFormField } from "@/components/form/InputFormField";
import { ComboboxFormField } from "@/components/form/ComboboxField";
import { Button } from "@/components/ui/button";
import { useModule } from "./_module/useModule";

const ProductIdPage = () => {
  const {
    form,
    flags,
    localStore,
    methods
  } = useModule();

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
            name="name"
            label="Nombre"
            disabled={flags.isLoading}
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
              disabled={flags.isLoading}
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
            disabled={flags.isLoading}
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
              disabled={flags.isLoading}
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
              disabled={flags.isLoading}
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
              disabled={flags.isLoading}
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
              disabled={flags.isLoading}
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
            disabled={flags.isLoading}
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
            disabled={flags.isLoading}
            type="file"
            className="mb-4"
          />
          {
            localStore.file && !localStore.image && (
              <div className="flex flex-col items-center gap-4 relative">
                <img src={localStore.file} alt="Imagen del producto" className="w-full max-h-96 object-contain" />
              </div>
            )
          }
          {
            localStore.image && (
              <div className="flex flex-col items-center gap-4 relative">
                <img src={URL.createObjectURL(localStore.image as File)} alt="Imagen del producto" className="w-full max-h-96 object-contain" />
              </div>
            )
          }
        </div>
      </div>
      <Button onClick={methods.submit} disabled={flags.isLoading} className="mt-4">
        Guardar
      </Button>
    </Form>
  );
};

export default ProductIdPage;