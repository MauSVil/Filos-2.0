"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ProductInputClient } from "@/types/RepositoryTypes/Product.client";

const defaultValues: ProductInputClient = {
  baseId: "",
  uniqId: "",
  color: "",
  name: "",
  webPagePrice: 0,
  wholesalePrice: 0,
  retailPrice: 0,
  specialPrice: 0,
  quantity: 0,
  size: "",
  deleted_at: null,
  image: "",
  updated_at: new Date(),
};

export const useModule = () => {
  const router = useRouter();

  const form = useForm<ProductInputClient>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(ProductInputClient),
  });

  const { watch, handleSubmit } = form;

  const image = watch("image");
  const uniqId = watch("uniqId");

  const specialPriceWatch = watch("specialPrice");
  const specialPriceDebounced = useDebounce(specialPriceWatch, 500);

  const debouncedUniqId = useDebounce(uniqId, 500);

  const newProductMutation = useMutation({
    mutationKey: ["products", "new"],
    mutationFn: async (data: ProductInputClient) => {
      const formData = new FormData();
      const { image, ...rest } = data;

      formData.append("image", data.image as File);
      formData.append("data", JSON.stringify(rest));

      const respData = await ky
        .post("/api/products", {
          body: formData,
        })
        .json();

      return respData;
    },

    onSuccess: () => {
      toast.success("Se creo el producto correctamente");
      router.push("/products");
    },

    onError: (err) => {
      toast.error("Hubo un error al crear el producto");
    },
  });

  useEffect(() => {
    if (debouncedUniqId) {
      const baseId = debouncedUniqId.slice(0, 6);

      form.setValue("baseId", baseId);
    } else {
      form.setValue("baseId", "");
    }
  }, [debouncedUniqId]);

  useEffect(() => {
    form.setValue('retailPrice', specialPriceDebounced + 50);
    form.setValue('wholesalePrice', specialPriceDebounced + 40);
  }, [specialPriceDebounced]);

  const submit = handleSubmit(async (data) => {
    await newProductMutation.mutateAsync(data);
  });

  return {
    form,
    localStore: {
      image,
    },
    methods: {
      submit,
    },
    isLoading: newProductMutation.isPending,
  };
};
