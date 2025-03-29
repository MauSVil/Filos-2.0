import { useQuery } from "@tanstack/react-query";
import ky from "ky";

import { Product } from "@/types/RepositoryTypes/Product";

export const useProducts = () => {
  return useQuery<{ data: Product[]; count: number }>({
    queryKey: ["products"],
    queryFn: async () => {
      const resp = (await ky
        .post("/api/products/search", { json: {} })
        .json()) as { data: Product[]; count: number };

      return resp;
    },
  });
};
