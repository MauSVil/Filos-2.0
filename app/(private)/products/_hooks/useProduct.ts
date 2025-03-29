import { useQuery } from "@tanstack/react-query";
import ky from "ky";

import { Product } from "@/types/MongoTypes/Product";

export const useProduct = (id: string) => {
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const resp = (await ky
        .post("/api/products/search", { json: { id } })
        .json()) as { data: Product[]; count: number };

      return resp;
    },
  });

  return {
    productQuery,
  };
};
