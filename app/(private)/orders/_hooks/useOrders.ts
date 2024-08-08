import { Order } from "@/types/MongoTypes/Order"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"

export const useOrders = ({ page }: { page: number }) => {
  return useQuery<{ data: Order[], count: number }>({
    queryKey: ['orders', { page }],
    queryFn: async () => {
      const resp = await ky.post('/api/orders/search', { json: { page } }).json() as { data: Order[], count: number }
      return resp
    }
  })
}