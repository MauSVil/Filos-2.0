import { NotificationType } from "@/types/MongoTypes/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useMemo } from "react";
import { ScrollArea } from "../ui/scroll-area";
import moment from "moment";
import ky from "ky";
import { toast } from "sonner";

interface Props {
  notifications: NotificationType[];
  onNotificationClick: (notification: NotificationType) => void;
}

const Notifications = (props: Props) => {
  const { notifications, onNotificationClick } = props;

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  const readNotifications = useMemo(() => {
    return notifications.filter((notification) => notification.read);
  }, [notifications]);

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      await ky.put(`/api/notifications/${notification._id}`, {
        json: { read: true },
      }).json();

      onNotificationClick(notification);

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error("Error al intentar abrir la notificación");
    }
  };

  return (
    <div>
      <Tabs defaultValue="unread">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="unread">Sin leer</TabsTrigger>
          <TabsTrigger value="read">Leidos</TabsTrigger>
        </TabsList>
        <TabsContent value="unread">
          <ScrollArea className="h-[400px]">
            {
              unreadNotifications.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-lg text-muted-foreground">No hay notificaciones sin leer</p>
                </div>
              )
            }
            {
                unreadNotifications
                .sort((a, b) => moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime())
                .map((notification, idx) => (
                  <div
                  key={idx}
                  className="flex items-center justify-between gap-4 p-2 cursor-pointer border-b-2 border-primary-foreground mb-2 pr-4 hover:bg-primary/10 rounded-medium"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="grid gap-2">
                    <p className="text-md font-medium leading-none">{notification.title}</p>
                    <p className="text-sm font-medium leading-none text-blue-200">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mb-2">{moment(notification.timestamp).format('DD/MM/YYYY:HH:mm')}</p>
                  </div>
                </div>
                ))
              }
          </ScrollArea>
        </TabsContent>
        <TabsContent value="read">
          <ScrollArea className="h-[400px]">
            {
              readNotifications.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-lg text-muted-foreground">No hay notificaciones leidas</p>
                </div>
              )
            }
            {
              readNotifications
              .sort((a, b) => moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime())
              .map((notification, idx) => (
                <div
                key={idx}
                className="flex items-center justify-between gap-4 p-2 cursor-pointer border-b-2 border-primary-foreground mb-2 pr-4 hover:bg-primary/10 rounded-medium"
              >
                <div className="grid gap-2">
                  <p className="text-md font-medium leading-none">{notification.title}</p>
                  <p className="text-sm font-medium leading-none text-blue-200">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mb-2">{moment(notification.timestamp).format('DD/MM/YYYY:HH:mm')}</p>
                </div>
              </div>
              ))
            }
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Notifications;