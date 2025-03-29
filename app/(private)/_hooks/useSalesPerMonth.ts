import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";

export const useSalesPerMonth = () => {
  return useQuery<{ [year: number]: { [month: string]: number } }>({
    queryKey: ["salesPerMonth"],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = (await ky
          .get("/api/statistics/dashboard/sales")
          .json()) as { data: { [year: number]: { [month: string]: number } } };

        return resp.data || {};
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });
};
