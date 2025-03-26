import { Product } from "@/types/MongoTypes/Product";
import { ProductClient, ProductModel } from "@/types/RepositoryTypes/Product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import ky from "ky";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const defaultValues: ProductClient = {
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

  const params = useParams();
  const id = params.id;
  
  const form = useForm<ProductClient>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(ProductModel),
  });

  const { watch, handleSubmit } = form;

  // Watchers
  const uniqId = watch('uniqId');
  const image = watch('image');

  
  // Misc
  const debouncedUniqId = useDebounce(uniqId, 500);

  // Queries
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const resp = await ky.post('/api/products/search', { json: { id } }).json() as { data: Product[], count: number }
      return resp
    }
  })

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
      })

      setFile(productQuery.data.data[0].image);
    }
  }, [productQuery.data]);

  useEffect(() => {
    if (debouncedUniqId) {
      const baseId = debouncedUniqId.slice(0, 6);
      form.setValue('baseId', baseId);
    }
  }, [debouncedUniqId]);

  // Handlers
  const submit = handleSubmit(async (data) => {
    console.log(data);
  });

  return {
    form,
    localStore: {
      product: productQuery.data?.data[0],
      file,
      image
    },
    methods: {
      setFile,
      submit,
    },
    flags: {
      isLoading: productQuery.isLoading,
      isError: productQuery.isError,
    }
  }
}