import { useMutation, useQuery } from "@tanstack/react-query";
import ky from "ky";

export const useEditPrice = (inputVal: string) => {
  const productsQuery = useQuery({
    queryKey: ["products", "editPrices", inputVal],
    queryFn: async () => {
      const response = (await ky
        .get(`/api/v2/products/search?q=${inputVal}`)
        .json()) as { data: { hits: any[] } };

      return response.data.hits || [];
    },
  });

  const editPricesMutation = useMutation({
    mutationFn: async (values: {
      uniqId: string;
      specialPrice: number;
      wholesalePrice: number;
      retailPrice: number;
      webPagePrice: number;
    }) => {
      await ky.post(`/api/products/editPrices`, { json: values });
    },
  });

  return {
    productsQuery,
    editPricesMutation,
  };
};
