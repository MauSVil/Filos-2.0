import { Contact } from "@/types/MongoTypes/Contact"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { toast } from "sonner"

export const useContact = ({ phone_id, enabled = false }: { phone_id?: string, enabled?: boolean }) => {
  return useQuery<Contact>({
    queryKey: ['contacts', { phone_id }],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = await ky.get(`/api/contacts/${phone_id}`).json() as Contact
        return resp
      } catch (error: any) {
        toast.error('An error occurred')
        throw new Error('An error occurred')
      }
    },
    enabled
  })
}