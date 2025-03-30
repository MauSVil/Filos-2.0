import { Catalog } from "@/types/RepositoryTypes/Catalog";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";


export const useCatalog = ({ id }: { id: string }) => {
  return useQuery<Catalog>({
    queryKey: ["catalogs"],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = (await ky
          .post("/api/catalogs/search", { json: { id } })
          .json()) as Catalog;

        return resp;
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });
};
