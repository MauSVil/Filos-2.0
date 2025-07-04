"use client";

import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateBuyer } from "../../_hooks/useCreateBuyer";

import { InputFormField } from "@/components/form/InputFormField";
import { Form } from "@/components/form";
import { Button } from "@/components/ui/button";
import { SwitchFormField } from "@/components/form/SwitchFormField";
import { BuyerInputSchema, BuyerInputType } from "@/types/v2/Buyer/ClientSafeSchema";


const defaultValues: BuyerInputType = {
  name: "",
  email: "",
  phone: "",
  address: "",
  isChain: false,
};

const NewBuyersContent = () => {
  const mutation = useCreateBuyer();

  const form = useForm<BuyerInputType>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(BuyerInputSchema),
  });

  const { handleSubmit } = form;

  const control = form.control as any as Control<BuyerInputType>;

  const onSubmit = (values: BuyerInputType) => {
    const formdata = new FormData();

    formdata.append("data", JSON.stringify(values));
    mutation.mutate(formdata);
  };

  return (
    <div className="flex flex-col items-center py-4 gap-3">
      <Form {...form}>
        <form
          noValidate
          className="w-full mt-3 flex flex-col gap-8 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8"
        >
          <div className="flex w-full justify-end">
            <Button
              color="default"
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              Guardar
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <InputFormField
              controllerProps={{
                control,
                name: "name",
              }}
              label="Nombre"
              name="name"
            />
            <InputFormField
              controllerProps={{
                control,
                name: "email",
              }}
              label="Correo Electrónico"
              name="email"
            />
            <InputFormField
              controllerProps={{
                control,
                name: "phone",
              }}
              label="Teléfono"
              name="phone"
            />
            <InputFormField
              controllerProps={{
                control,
                name: "address",
              }}
              label="Dirección"
              name="address"
            />
            <SwitchFormField
              className="flex flex-col gap-2"
              controllerProps={{
                control,
                name: "isChain",
              }}
              label="Es un cliente de cadena?"
              name="isChain"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewBuyersContent;
