'use client';

import ProductForm from "@/components/shared/ProductForm"
import { useModule } from "../_module/useModule"

const Content = () => {
  const { form, localStore, methods } = useModule();

  return (
    <ProductForm
      form={form}
      isLoading={false}
      submit={methods.submit}
      image={localStore.image as any}
    />
  )
}

export default Content