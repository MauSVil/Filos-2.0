import { Product } from "@/types/MongoTypes/Product"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import moment from "moment"
import { toast } from "sonner"

export const useDashboard = () => {
  return useQuery<{ [key: string]: Product }>({
    queryKey: ['dashboard'],
    retry: 0,
    queryFn: async () => {
      try {
        const today = moment().startOf('day');
        const endDate = today.clone().add(15, 'day').endOf('day');

        const resp = await ky.post('/api/dashboard/products-out-of-stock', {
          json: {
            startDate: today.toISOString(),
            endDate: endDate.toISOString()
          }
        }).json() as { data: { [key: string]: Product } }
        return resp.data || {}
      } catch (error) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
  })
}