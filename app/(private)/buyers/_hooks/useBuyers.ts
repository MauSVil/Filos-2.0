import { Buyer } from "@/types/MongoTypes/Buyer"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "react-toastify"

export const useBuyers = ({ page }: { page: number }) => {
  return useQuery<{ data: Buyer[], count: number }>({
    queryKey: ['buyers', { page }],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = await ky.post('/api/buyers/search', { json: { page } }).json() as { data: Buyer[], count: number }
        return resp
      } catch (error) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
  })
}