import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";

import { MovementHistory } from "@/types/RepositoryTypes/MovementHistory";

export const useHistoryMovements = () => {
  return useQuery<MovementHistory[]>({
    queryKey: ["movementsHistory"],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = (await ky.get("/api/movementsHistory/search").json()) as {
          data: MovementHistory[];
        };

        return resp.data || [];
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });
};
