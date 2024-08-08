import { Product } from "@/types/MongoTypes/Product"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"

export const useProducts = ({ page }: { page: number }) => {
  return useQuery<{ data: Product[], count: number }>({
    queryKey: ['products', { page }],
    queryFn: async () => {
      const resp = await ky.post('/api/products/search', { json: { page } }).json() as { data: Product[], count: number }
      return resp
    }
  })
}