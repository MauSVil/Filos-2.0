"use client";

import { useModule } from "./_module/useModule";

import ProductForm from "@/components/shared/ProductForm";

const ProductIdPage = () => {
  const { form, flags, localStore, methods } = useModule();

  return (
    <ProductForm
      file={localStore.file}
      form={form}
      image={localStore.image as any}
      isLoading={flags.isLoading}
      submit={methods.submit}
      onImageChange={methods.handleImageChange}
    />
  );
};

export default ProductIdPage;
