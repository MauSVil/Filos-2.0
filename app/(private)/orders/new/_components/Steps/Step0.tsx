import { useFormContext } from "react-hook-form";
import { CreateFormValues } from "../../schemas/CreateFormValues";
import { InputFormField } from "@/components/form/InputFormField";
import { SelectFormField } from "@/components/form/SelectFormField";

const Step0 = () => {
  const { control, formState } = useFormContext<CreateFormValues>();
  return (
    <div className="flex flex-col gap-2">
      <InputFormField
        key="name"
        error={formState.errors.name?.message}
        controllerProps={{
          control,
          name: "name",
        }}
        label="Nombre"
        name="name"
        description="Nombre del comprador"
      />
      <SelectFormField
        key="buyer"
        error={formState.errors.buyer?.message}
        controllerProps={{
          control,
          name: "buyer",
        }}
        label="Comprador"
        name="buyer"
        description="Seleccione un comprador"
        items={[
          { label: "Comprador 1", value: "buyer1" },
          { label: "Comprador 2", value: "buyer2" },
          { label: "Comprador 3", value: "buyer3" },
        ]}
      />
    </div>
  )
}

export default Step0;