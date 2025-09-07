"use client";

import { useRouter } from "next/navigation";
import { useModule } from "../_module/useModule";

import ProductForm from "@/components/shared/ProductForm";

const Content = () => {
  const router = useRouter();
  const { form, localStore, methods, isLoading } = useModule();

  const handleCancel = () => {
    router.push("/products");
  };

  return (
    <ProductForm
      form={form}
      image={localStore.image as File}
      isLoading={isLoading}
      submit={methods.submit}
      onCancel={handleCancel}
      onImageChange={methods.handleImageChange}
    />
  );
};

export default Content;
