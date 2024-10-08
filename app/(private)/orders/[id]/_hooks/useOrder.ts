import { Order } from "@/types/MongoTypes/Order"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"

export const useOrder = ({ id }: { id: string }) => {
  return useQuery<Order>({
    queryKey: ['order', { id }],
    retry: 0,
    queryFn: async () => {
      const resp = await ky.post('/api/orders', { json: { id } }).json() as Order
      return resp
    },
  })
}