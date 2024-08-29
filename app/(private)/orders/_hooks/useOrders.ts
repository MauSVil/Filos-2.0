import { Order } from "@/types/MongoTypes/Order"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"

export const useOrders = ({ page, status }: { page: number, status: string }) => {
  return useQuery<{ data: Order[], count: number }>({
    queryKey: ['orders', { page, status }],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = await ky.post('/api/orders/search', { json: { page, status } }).json() as { data: Order[], count: number }
        return resp
      } catch (error) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
  })
}