import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

import { InputFormField } from "@/components/form/InputFormField";
import { ComboboxFormField } from "@/components/form/ComboboxField";
import { useBuyers } from "@/app/(private)/buyers/_hooks/useBuyers";
import { RadioGroupFormField } from "@/components/form/RadioGroupFormField";
import { DateFormField } from "@/components/form/DateFormField";
import { OrderInput } from "@/types/RepositoryTypes/Order";

const Step0 = ({ loading = false }: { loading?: boolean }) => {
  const { control } = useFormContext<OrderInput>();

  const buyersQuery = useBuyers({});
  const buyers = useMemo(() => buyersQuery.data || [], [buyersQuery.data]);
  const buyersOptions = useMemo(
    () =>
      buyers.map((buyer) => ({
        label: buyer.name,
        value: buyer._id,
      })),
    [buyers],
  );

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Informacion de la orden</h3>
      <InputFormField
        key="name"
        controllerProps={{
          control,
          name: "name",
        }}
        disabled={loading}
        label="Nombre"
        name="name"
      />
      <ComboboxFormField
        controllerProps={{
          control,
          name: "buyer",
        }}
        emptyLabel="No hay compradores"
        isLoading={loading}
        items={buyersOptions}
        label="Comprador"
        placeholder="Selecciona un comprador..."
        searchLabel="Buscar un comprador..."
      />

      <DateFormField
        controllerProps={{
          control,
          name: "dueDate",
        }}
        disabled={loading}
        label="Fecha de entrega"
      />

      <RadioGroupFormField
        controllerProps={{
          control,
          name: "orderType",
        }}
        direction="row"
        items={[
          {
            label: "Especial",
            value: "specialPrice",
            className: "text-green-400",
          },
          {
            label: "Mayoreo",
            value: "wholesalePrice",
            className: "text-purple-400",
          },
          {
            label: "Semi-mayoreo",
            value: "retailPrice",
            className: "text-yellow-400",
          },
          {
            label: "Pagina web",
            value: "webPagePrice",
            className: "text-red-400",
          },
        ]}
        label="Tipo de orden"
      />
      <div className="flex gap-4 w-full">
        <InputFormField
          key="freightPrice"
          className="w-full"
          controllerProps={{
            control,
            name: "freightPrice",
          }}
          disabled={loading}
          label="Flete"
          name="freightPrice"
          placeholder="Escribe el precio del flete..."
          type="number"
        />
        <InputFormField
          key="advancedPayment"
          className="w-full"
          controllerProps={{
            control,
            name: "advancedPayment",
          }}
          disabled={loading}
          label="Anticipo"
          name="advancedPayment"
          placeholder="Escribe el anticipo..."
          type="number"
        />
      </div>
      <InputFormField
        key="description"
        controllerProps={{
          control,
          name: "description",
        }}
        disabled={loading}
        label="Descripcion"
        name="description"
        placeholder="Escribe una descripcion..."
      />
    </div>
  );
};

export default Step0;
