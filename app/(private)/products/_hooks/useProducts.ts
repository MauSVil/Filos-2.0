import { Product } from "@/types/MongoTypes/Product"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"

export const useProducts = ({ page, q }: { page?: number, q?: string }) => {
  return useQuery<{ data: Product[], count: number }>({
    queryKey: ['products', { page, q }],
    queryFn: async () => {
      const resp = await ky.post('/api/products/search', { json: { page, q } }).json() as { data: Product[], count: number }
      return resp
    },
  })
}