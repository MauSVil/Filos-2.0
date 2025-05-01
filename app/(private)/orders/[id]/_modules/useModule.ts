import { OrderClientType } from "@/types/v2/Order/Client.type"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"

export const useModule = ({ id }: { id: string }) => {
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const resp = await ky.get(`/api/v2/orders/${id}`).json<OrderClientType>()
      return resp
    },
  })

  const refetch = () => {
    orderQuery.refetch()
  }

  return {
    localData: {
      order: orderQuery.data || ({} as OrderClientType),
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