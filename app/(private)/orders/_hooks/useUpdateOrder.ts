import { useMutation } from "@tanstack/react-query";
import ky, { HTTPError } from "ky";
import { toast } from "sonner";

import { SerializedError } from "@/types/Chat";
import { Order } from "@/types/RepositoryTypes/Order";

export const useUpdateOrder = () => {
  return useMutation<{}, SerializedError, Partial<Order>>({
    mutationFn: async (order: Partial<Order>) => {
      const response = await ky.put("/api/orders/status", { json: order });
      const result = (await response.json()) as any;

      return result;
    },
    onSuccess: () => {
      toast.success("Se ha editado la orden");
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const errorData = (await error.response.json()) as { error: string };

        toast.error(errorData.error || "Hubo un error al editar la orden");
      } else if (error instanceof Error) {
        toast.error(error.message || "Hubo un error al editar la orden");
      } else {
        toast.error("Hubo un error desconocido al editar la orden");
      }
    },
  });
};
