"use client";

import { Form } from "@/components/form";
import Layout from "@/components/layout/layout";
import { Button } from "@nextui-org/button";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFormValues } from "../_schemas/CreateFormValues";
import { InputFormField } from "@/components/form/InputFormField";
import { useCreateBuyer } from "../../_hooks/useCreateBuyer";

const defaultValues: CreateFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const NewBuyersContent = () => {
  const mutation = useCreateBuyer();

  const form = useForm<CreateFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(CreateFormValues),
  });

  const { handleSubmit } = form;

  const control = form.control as any as Control<CreateFormValues>;

  const onSubmit = (values: CreateFormValues) => {
    const formdata = new FormData();
    formdata.append('data', JSON.stringify(values));
    mutation.mutate(formdata);
  };

  return (
    <Layout
      title="Nuevo Comprador"
      breadcrumbs={["Compradores", "Nuevo"]}
      actions={
        <div className="flex gap-3">
          <Button
            size="sm"
            color="primary"
            onClick={handleSubmit(onSubmit as any)}
          >
              Guardar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center py-4 gap-3">
        <Form {...form}>
          <form
            noValidate
            className="w-full mt-3 flex flex-col gap-8 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8"
          >
            <div className="flex flex-col gap-4">
              <InputFormField
                controllerProps={{
                  control,
                  name: "name",
                }}
                error={form.formState.errors.name?.message}
                label="Nombre"
                name="name"
                description="Nombre del comprador"
              />
              <InputFormField
                controllerProps={{
                  control,
                  name: "email",
                }}
                error={form.formState.errors.email?.message}
                label="Correo Electrónico"
                name="email"
                description="Correo electrónico del comprador"
              />
              <InputFormField
                controllerProps={{
                  control,
                  name: "phone",
                }}
                error={form.formState.errors.phone?.message}
                label="Teléfono"
                name="phone"
                description="Teléfono del comprador"
              />
              <InputFormField
                controllerProps={{
                  control,
                  name: "address",
                }}
                error={form.formState.errors.address?.message}
                label="Dirección"
                name="address"
                description="Dirección del comprador"
              />
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  )
}

export default NewBuyersContent;