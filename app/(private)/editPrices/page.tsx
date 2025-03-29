"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import _ from "lodash";

import { CreateFormValues } from "./_schemas/CreateFormValues";
import { useEditPrice } from "./_hooks/useEditPrices";

import { Form } from "@/components/form";
import { Button } from "@/components/ui/button";
import { SelectFormField } from "@/components/form/SelectFormField";
import { InputFormField } from "@/components/form/InputFormField";

const defaultValues: CreateFormValues = {
  uniqId: "",
  specialPrice: 0,
  wholesalePrice: 0,
  retailPrice: 0,
  webPagePrice: 0,
};

const EditPricesPage = () => {
  const [inputSearch, setInputSearch] = useState("");
  const form = useForm<CreateFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(CreateFormValues),
  });

  const { handleSubmit, watch } = form;

  const baseIdInput = watch("uniqId");
  const debouncedSearchTerm = useDebounce(inputSearch, 300);
  const { productsQuery, editPricesMutation } =
    useEditPrice(debouncedSearchTerm);
  const [productsMapped, setProductsMapped] = useState<Record<string, any>>({});

  const onSubmit = (values: CreateFormValues) => {
    editPricesMutation.mutate(values);
  };

  useEffect(() => {
    const mapped = _.keyBy(productsQuery.data, "uniqId");

    setProductsMapped(mapped);
  }, [productsQuery.data]);

  useEffect(() => {
    if (baseIdInput) {
      form.setValue("retailPrice", productsMapped[baseIdInput]?.retailPrice);
      form.setValue("specialPrice", productsMapped[baseIdInput]?.specialPrice);
      form.setValue(
        "wholesalePrice",
        productsMapped[baseIdInput]?.wholesalePrice,
      );
      form.setValue("webPagePrice", productsMapped[baseIdInput]?.webPagePrice);
    }
  }, [baseIdInput]);

  return (
    <div className="flex flex-col items-center py-4 gap-3 flex-1">
      <Form {...form}>
        <form
          noValidate
          className="w-full mt-3 flex flex-col gap-8 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8"
        >
          <div className="flex w-full justify-end">
            <Button
              color="default"
              disabled={!baseIdInput || editPricesMutation.isPending}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              Guardar
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <SelectFormField
              controllerProps={{
                control: form.control,
                name: "uniqId",
              }}
              disabled={productsQuery.isLoading || editPricesMutation.isPending}
              handleValueChange={(val) => setInputSearch(val)}
              items={(productsQuery.data || []).map((pr) => ({
                label: pr.uniqId,
                value: pr.uniqId,
              }))}
              label="Clave Unica"
            />

            <InputFormField
              controllerProps={{
                control: form.control,
                name: "specialPrice",
              }}
              disabled={
                !baseIdInput ||
                productsQuery.isLoading ||
                editPricesMutation.isPending
              }
              label="Precio especial"
              name="specialPrice"
              type="number"
            />

            <InputFormField
              controllerProps={{
                control: form.control,
                name: "wholesalePrice",
              }}
              disabled={
                !baseIdInput ||
                productsQuery.isLoading ||
                editPricesMutation.isPending
              }
              label="Precio mayoreo"
              name="wholesalePrice"
              type="number"
            />

            <InputFormField
              controllerProps={{
                control: form.control,
                name: "retailPrice",
              }}
              disabled={
                !baseIdInput ||
                productsQuery.isLoading ||
                editPricesMutation.isPending
              }
              label="Precio semi-mayoreo"
              name="retailPrice"
              type="number"
            />

            <InputFormField
              controllerProps={{
                control: form.control,
                name: "webPagePrice",
              }}
              disabled={
                !baseIdInput ||
                productsQuery.isLoading ||
                editPricesMutation.isPending
              }
              label="Precio pagina web"
              name="webPagePrice"
              type="number"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditPricesPage;
