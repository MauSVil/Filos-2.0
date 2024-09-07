import { Product } from "@/types/MongoTypes/Product"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"

export const useProducts = ({ products }: { products?: string[] }) => {
  return useQuery<Product[]>({
    queryKey: ['products', { products }],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = await ky.post(`/api/products/search`, { json: { ids: products } }).json() as { data: Product[] }
        return resp.data || []
      } catch (error: any) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
  })
}