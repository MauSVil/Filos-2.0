import { Order } from "@/types/v2/Order.type"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"

export const useModule = ({ id }: { id: string }) => {
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const resp = await ky.get(`/api/v2/orders/${id}`).json<Order>()
      return resp
    },
  })

  const refetch = () => {
    orderQuery.refetch()
  }

  return {
    localData: {
      order: orderQuery.data || ({} as Order),
    },
    methods: {
      refetch,
    },
    flags: {
      isLoading: orderQuery.isLoading,
      isError: orderQuery.isError,
      isRefetching: orderQuery.isRefetching,
    }
  }
}