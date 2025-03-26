'use client';

import { useModule } from "./_module/useModule";
import ProductForm from "@/components/shared/ProductForm";

const ProductIdPage = () => {
  const {
    form,
    flags,
    localStore,
    methods
  } = useModule();

  return (
    <ProductForm
      form={form}
      isLoading={flags.isLoading}
      submit={methods.submit}
      image={localStore.image as any}
      file={localStore.file}
    />
  );
};

export default ProductIdPage;