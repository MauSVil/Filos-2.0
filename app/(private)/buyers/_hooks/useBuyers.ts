import { Buyer } from "@/types/MongoTypes/Buyer"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"

export const useBuyers = ({ page, buyers }: { page?: number, buyers?: string[] }) => {
  return useQuery<{ data: Buyer[], count: number }>({
    queryKey: ['buyers', { page, buyers }],
    retry: 0,
    queryFn: async () => {
      try {
        const json = {
          ...(page && { page }),
          ...(buyers && { buyers }),
        }
        const resp = await ky.post('/api/buyers/search', { json }).json() as { data: Buyer[], count: number }
        return resp
      } catch (error) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
  })
}