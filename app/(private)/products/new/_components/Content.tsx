"use client";

import { useModule } from "../_module/useModule";

import ProductForm from "@/components/shared/ProductForm";

const Content = () => {
  const { form, localStore, methods } = useModule();

  return (
    <ProductForm
      form={form}
      image={localStore.image as File}
      isLoading={false}
      submit={methods.submit}
    />
  );
};

export default Content;
