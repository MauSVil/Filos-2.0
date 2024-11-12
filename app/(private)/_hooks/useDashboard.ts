import { Product } from "@/types/MongoTypes/Product"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"
import moment from "moment-timezone";

export const useDashboard = () => {
  return useQuery<{ [key: string]: Product }>({
    queryKey: ['dashboard'],
    retry: 0,
    queryFn: async () => {
      try {
        const today = moment().tz('America/Mexico_City').startOf('day');
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