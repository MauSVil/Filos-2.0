import { SerializedError } from "@/types/Chat";
import { Order } from "@/types/MongoTypes/Order";
import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";

export const useUpdateOrder = () => {
  return useMutation<{}, SerializedError, Partial<Order>>({
    mutationFn: async (order: Partial<Order>) => {
      const response = await ky.put('/api/orders', { json: order });
      const result = await response.json() as any;
      return result;
    },
    onSuccess: () => {
      toast.success('Se ha editado la orden');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};