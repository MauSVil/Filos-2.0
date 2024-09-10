import { Buyer } from "@/types/MongoTypes/Buyer"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"

export const useBuyers = ({ buyers }: { buyers?: string[] }) => {
  return useQuery<Buyer[]>({
    queryKey: ['buyers', { buyers }],
    retry: 0,
    queryFn: async () => {
      try {
        const json = {
          ...(buyers && { buyers }),
        }
        const resp = await ky.post('/api/buyers/search', { json }).json() as Buyer[]
        return resp
      } catch (error) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
  })
}