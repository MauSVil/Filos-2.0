"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import ky from "ky";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ProductInputClient } from "@/types/RepositoryTypes/Product.client";
import { Product } from "@/types/RepositoryTypes/Product";

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
  const [file, setFile] = useState<string>();
  const [imageFile, setImageFile] = useState<File | undefined>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const params = useParams();
  const id = params.id;

  const form = useForm<ProductInputClient>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(ProductInputClient),
  });

  const { watch, handleSubmit } = form;

  // Watchers
  const uniqId = watch("uniqId");
  const image = watch("image");

  // Misc
  const debouncedUniqId = useDebounce(uniqId, 500);

  // Queries
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const resp = (await ky
        .post("/api/products/search", { json: { id } })
        .json()) as { data: Product[]; count: number };

      return resp;
    },
  });

  useEffect(() => {
    if (productQuery.data?.data && productQuery.data?.data.length > 0) {
      form.reset({
        name: productQuery.data.data[0].name,
        baseId: productQuery.data.data[0].baseId,
        uniqId: productQuery.data.data[0].uniqId,
        color: productQuery.data.data[0].color,
        webPagePrice: productQuery.data.data[0].webPagePrice,
        wholesalePrice: productQuery.data.data[0].wholesalePrice,
        retailPrice: productQuery.data.data[0].retailPrice,
        specialPrice: productQuery.data.data[0].specialPrice,
        quantity: productQuery.data.data[0].quantity,
        size: productQuery.data.data[0].size,
        sweaterWaste: productQuery.data.data[0].sweaterWaste,
        sweaterWeight: productQuery.data.data[0].sweaterWeight,
      });

      // Add cache buster to existing image URL
      const imageUrl = productQuery.data.data[0].image;
      if (imageUrl) {
        const cacheBustedUrl = imageUrl.includes('?')
          ? `${imageUrl}&t=${Date.now()}`
          : `${imageUrl}?t=${Date.now()}`;
        setFile(cacheBustedUrl);
      }
    }
  }, [productQuery.data]);

  useEffect(() => {
    if (debouncedUniqId) {
      const baseId = debouncedUniqId.slice(0, 6);

      form.setValue("baseId", baseId);
    }
  }, [debouncedUniqId]);

  const editProductMutation = useMutation({
    mutationKey: ["products", "edit"],
    mutationFn: async (data: ProductInputClient) => {
      const formData = new FormData();
      const { image, ...rest } = data;

      if (image && image instanceof File) {
        formData.append("image", image);
      }
      formData.append("data", JSON.stringify(rest));

      try {
        const respData = await ky
          .put(`/api/products/${id}`, {
            body: formData,
            timeout: 60000, // 60 seconds timeout for large AI images
          })
          .json();

        console.log('[editProductMutation] Success response:', respData);
        return respData;
      } catch (error) {
        console.error('[editProductMutation] Request failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate products queries to refetch the list with updated images
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Se edito el producto correctamente");
      router.push("/products");
    },
    onError: (err) => {
      console.error('[editProductMutation] Error:', err);
      toast.error("Hubo un error al editar el producto");
    },
  });

  // Handlers
  const submit = handleSubmit(async (data) => {
    editProductMutation.mutate(data);
  });

  const handleImageChange = (newImage: File) => {
    console.log('[handleImageChange] New image:', {
      name: newImage.name,
      type: newImage.type,
      size: newImage.size
    });
    setImageFile(newImage);
    form.setValue("image", newImage as any);
  };

  return {
    form,
    localStore: {
      product: productQuery.data?.data[0],
      file,
      image: imageFile,
    },
    methods: {
      setFile,
      submit,
      handleImageChange,
    },
    flags: {
      isLoading: productQuery.isLoading,
      isError: productQuery.isError,
    },
  };
};
