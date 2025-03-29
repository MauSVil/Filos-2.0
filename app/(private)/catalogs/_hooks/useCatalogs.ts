import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";

import { Catalog } from "@/types/MongoTypes/Catalog";

export const useCatalogs = () => {
  return useQuery<Catalog[]>({
    queryKey: ["catalogs"],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = (await ky.get("/api/catalogs/search").json()) as Catalog[];

        return resp;
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });
};
