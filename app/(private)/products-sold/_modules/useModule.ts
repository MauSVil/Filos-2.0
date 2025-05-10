import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import moment from "moment";
import { useState } from "react";

export const useModule = () => {
  const [initDate, setInitDate] = useState<Date | undefined>(moment().startOf('year').toDate());
  const [endDate, setEndDate] = useState<Date | undefined>(moment().endOf('year').toDate());

  const productsSoldQuery = useQuery({
    queryKey: ["products-sold", initDate, endDate],
    queryFn: async () => {
      const resp = await ky.post('/api/v2/reports/products-sold', { json: {initDate, endDate} }).json<Record<string, { id: string, product: string, quantity: number }>>()
      return resp
    },
    enabled: !!initDate && !!endDate,
  })

  return {
    localData: {
      productsSold: productsSoldQuery.data,
      initDate,
      endDate,
    },
    methods: {
      setInitDate,
      setEndDate,
    },
    flags: {
      isLoading: productsSoldQuery.isLoading,
      isRefetching: productsSoldQuery.isRefetching,
      isError: productsSoldQuery.isError,
    }
  }
}