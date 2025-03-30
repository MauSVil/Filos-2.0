import { Notification } from "@/types/RepositoryTypes/Notification";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";


export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const resp = (await ky
        .post("/api/notifications/search", { json: {} })
        .json<Notification[]>())
      return resp;
    },
  });
};
