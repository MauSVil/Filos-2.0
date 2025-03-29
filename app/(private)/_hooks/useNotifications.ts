import { useQuery } from "@tanstack/react-query";
import ky from "ky";

import { NotificationType } from "@/types/MongoTypes/Notification";

export const useNotifications = () => {
  return useQuery<NotificationType[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const resp = (await ky
        .post("/api/notifications/search", { json: {} })
        .json()) as NotificationType[];

      return resp;
    },
  });
};
