"use client";

import type {CardProps} from "@nextui-org/react";

import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  ScrollShadow,
} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import NotificationItem from "./notification-item";
import { NotificationType } from "@/types/MongoTypes/Notification";
import { NotificationTabs } from "@/app/(private)/layout";
import { toast } from "react-toastify";
import ky from "ky";

interface Props {
  className?: string;
  notifications: { [ key in NotificationTabs ]: NotificationType[] };
  onNotificationClick: (notification: NotificationType) => void;
}

export default function Component(props: Props) {
  const { notifications, onNotificationClick, ...rest } = props;
  const [activeTab, setActiveTab] = React.useState<NotificationTabs>(NotificationTabs.All);

  const activeNotifications = notifications[activeTab];

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
    <Card className="w-full max-w-[420px]" {...props}>
      <CardHeader className="flex flex-col px-0 pb-0">
        <div className="flex w-full items-center justify-between px-5 py-2">
          <div className="inline-flex items-center gap-1">
            <h4 className="inline-block align-middle text-large font-medium">Notificaciones</h4>
            <Chip size="sm" variant="flat">
              {notifications[NotificationTabs.Unread].length}
            </Chip>
          </div>
          <Button className="h-8 px-3" color="primary" radius="full" variant="light">
            Marcar como leídas
          </Button>
        </div>
        <Tabs
          aria-label="Notifications"
          classNames={{
            base: "w-full",
            tabList: "gap-6 px-6 py-0 w-full relative rounded-none border-b border-divider",
            cursor: "w-full",
            tab: "max-w-fit px-2 h-12",
          }}
          color="primary"
          selectedKey={activeTab}
          variant="underlined"
          onSelectionChange={(selected) => setActiveTab(selected as NotificationTabs)}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center space-x-2">
                <span>Todos</span>
                <Chip size="sm" variant="flat">
                  {notifications[NotificationTabs.All].length}
                </Chip>
              </div>
            }
          />
          <Tab
            key="unread"
            title={
              <div className="flex items-center space-x-2">
                <span>Sin leer</span>
                <Chip size="sm" variant="flat">
                  {notifications[NotificationTabs.Unread].length}
                </Chip>
              </div>
            }
          />
        </Tabs>
      </CardHeader>
      <CardBody className="w-full gap-0 p-0">
        <ScrollShadow className="h-[350px] w-full">
          {activeNotifications?.length > 0 ? (
            activeNotifications.map((notification, idx) => (
              <NotificationItem
                key={idx}
                onClick={() => handleNotificationClick(notification)}
                {...notification}
              />
            ))
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <Icon className="text-default-400" icon="solar:bell-off-linear" width={40} />
              <p className="text-small text-default-400">No hay notificaciones</p>
            </div>
          )}
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}
