import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";

export const useBuyerStatistic = ({
  id,
  date,
}: {
  id: string;
  date?: string;
}) => {
  return useQuery<{
    finalAmountPerMonth: { [key: number]: number };
    productsPerMonth: { [key: number]: number };
    mostPopularProducts: { [key: string]: number };
    samples: number;
  }>({
    queryKey: ["buyersStatistics", { id, date }],
    retry: 0,
    queryFn: async () => {
      try {
        const json = {
          buyerId: id,
          date,
        };
        const resp = (await ky
          .post("/api/buyers/statistic", { json })
          .json()) as {
          finalAmountPerMonth: { [key: number]: number };
          productsPerMonth: { [key: number]: number };
          mostPopularProducts: { [key: string]: number };
          samples: number;
        };

        return resp;
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });
};
