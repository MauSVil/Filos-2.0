import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";

import { Buyer } from "@/types/MongoTypes/Buyer";

export const useBuyers = ({
  buyers,
  id,
}: {
  buyers?: string[];
  id?: string;
}) => {
  return useQuery<Buyer[]>({
    queryKey: ["buyers", { buyers, id }],
    retry: 0,
    queryFn: async () => {
      try {
        const json = {
          ...(buyers && { buyers }),
          ...(id && { id }),
        };
        const resp = (await ky
          .post("/api/buyers/search", { json })
          .json()) as Buyer[];

        return resp;
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });
};
