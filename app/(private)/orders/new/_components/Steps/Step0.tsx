import { useFormContext } from "react-hook-form";
import { CreateFormValues } from "../../schemas/CreateFormValues";
import { InputFormField } from "@/components/form/InputFormField";
import { ComboboxFormField } from "@/components/form/ComboboxField";
import { useBuyers } from "@/app/(private)/buyers/_hooks/useBuyers";
import { useMemo } from "react";
import { RadioGroupFormField } from "@/components/form/RadioGroupFormField";

const Step0 = () => {
  const { control } = useFormContext<CreateFormValues>();

  const buyersQuery = useBuyers({});
  const buyers = useMemo(() => buyersQuery.data?.data || [], [buyersQuery.data]);
  const buyersOptions = useMemo(() => buyers.map((buyer) => ({
    label: buyer.name,
    value: buyer._id,
  })), [buyers]);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Informacion de la orden</h3>
      <InputFormField
        key="name"
        controllerProps={{
          control,
          name: "name",
        }}
        label="Nombre"
        name="name"
      />
      <ComboboxFormField
        items={buyersOptions}
        controllerProps={{
          control,
          name: 'buyer'
        }}
        label='Comprador'
        placeholder='Selecciona un comprador...'
        searchLabel='Buscar un comprador...'
        emptyLabel="No hay compradores"
      />
      <RadioGroupFormField
        controllerProps={{
          control,
          name: 'orderType'
        }}
        direction="row"
        items={[
          { label: 'Especial', value: 'special', className: 'text-green-400' },
          { label: 'Mayoreo', value: 'wholesalePrice', className: 'text-purple-400' },
          { label: 'Menudeo', value: 'retailPrice', className: 'text-yellow-400' },
          { label: 'Pagina web', value: 'webPagePrice', className: 'text-red-400' },
        ]}
        label='Tipo de orden'
      />
      <div className="flex gap-4 w-full">
        <InputFormField
          className="w-full"
          key="freightPrice"
          controllerProps={{
            control,
            name: "freightPrice",
          }}
          label="Flete"
          name="freightPrice"
          type="number"
          placeholder="Escribe el precio del flete..."
        />
        <InputFormField
          className="w-full"
          key="advancedPayment"
          controllerProps={{
            control,
            name: "advancedPayment",
          }}
          label="Anticipo"
          type="number"
          name="advancedPayment"
          placeholder="Escribe el anticipo..."
        />
      </div>
      <InputFormField
        key="description"
        controllerProps={{
          control,
          name: "description",
        }}
        label="Descripcion"
        name="description"
        placeholder="Escribe una descripcion..."
      />
    </div>
  )
}

export default Step0;