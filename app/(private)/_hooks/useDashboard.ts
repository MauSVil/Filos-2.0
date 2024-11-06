import { Product } from "@/types/MongoTypes/Product"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"

export const useDashboard = () => {
  return useQuery<{ [key: string]: Product }>({
    queryKey: ['dashboard'],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = await ky.post('/api/dashboard/products-out-of-stock', {
          json: {
            startDate: '2024-10-01',
            endDate: '2024-10-31'
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