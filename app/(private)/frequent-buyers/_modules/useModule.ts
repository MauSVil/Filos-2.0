import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { useState } from "react"

export const useModule = () => {
  const [page, setPage] = useState(1)

  const buyersQuery = useQuery<Record<string, { orders: number; products: number }>>({
    queryKey: ["frequent-buyers"],
    queryFn: async () => {
      const resp = await ky.post("/api/v2/reports/frequent-buyers", {
        json: {
          initDate: null,
          endDate: null,
        },
        timeout: 10000,
      })
      const data = await resp.json<Record<string, { orders: number; products: number }>>()
      return data
    },
  })

  return {
    localData: {
      buyers: buyersQuery.data,
      page,
    },
    methods: {
      setPage,
    },
    flags: {
      isLoading: buyersQuery.isLoading,
      isError: buyersQuery.isError,
      isRefetching: buyersQuery.isRefetching,
    }
  }
}