import { SerializedError } from "@/types/Chat";
import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateBuyer = () => {
  const router = useRouter();
  return useMutation<{}, SerializedError, FormData>({
    mutationFn: async (requestData: FormData) => {
      const response = await ky.post('/api/buyers', { body: requestData });
      const result = await response.json() as any;
      return result;
    },
    onSuccess: () => {
      toast.success('Se ha creado el comprador');
      router.push('/buyers');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};