"use client";

import React, { ReactNode, useEffect, useMemo } from "react";
import {Avatar, Badge, Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spacer, Tooltip} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {usePathname, useRouter} from "next/navigation";

import {AcmeIcon} from "@/components/icon";
import {items} from "@/components/layout/sidebar-items";
import {cn} from "@/utils/cn";

import Sidebar from "@/components/layout/sidebar";
import Cookies from "js-cookie";
import NotificationsCard from "@/components/notifications/notification-card";
import { socket } from "./_socket";
import { useNotifications } from "./_hooks/useNotifications";
import { NotificationType } from "@/types/MongoTypes/Notification";

export enum NotificationTabs {
  All = "all",
  Unread = "unread",
  Archive = "archive",
}

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  const isCompact = useMediaQuery("(max-width: 768px)");
  const [notificationsState, setNotificationsState] = React.useState<{ [ key in NotificationTabs ]: NotificationType[] }>({ all: [], unread: [], archive: [] });

  const pathname = usePathname();
  const currentPath = pathname.split("/")?.[1]

  const router = useRouter();

  const notifications = useNotifications();
  const notificationsData = useMemo(() => notifications?.data || [], [notifications.data]);

  React.useEffect(() => {
    setNotificationsState((prevState) => {
      return {
        ...prevState,
        all: notificationsData,
        unread: notificationsData.filter((notification) => !notification.read),
        archive: notificationsData.filter((notification) => notification.read),
      };
    });
  }, [notificationsData.length]);

  useEffect(() => {
    socket.on('new_notification', (notification: NotificationType) => {
      setNotificationsState((prevState) => {
        return {
          ...prevState,
          all: [notification, ...prevState.all],
          unread: [notification, ...prevState.unread],
        };
      });
    });

    return () => {
      socket.off('new_notification');
    };
  }, []);

  return (
    <div className="flex h-dvh w-full">
      <div
        className={cn(
          "relative flex h-full w-72 flex-col !border-r-small border-divider p-6 transition-width",
          {
            "w-16 items-center px-2 py-6": isCompact,
          },
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between",

            {
              "justify-center gap-3 flex-col": isCompact,
            },
          )}
        >
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <AcmeIcon className="text-background scale-150" />
            </div>
            <span
              className={cn("text-small font-bold uppercase opacity-100", {
                "w-0 opacity-0 hidden": isCompact,
              })}
            >
              Filos
            </span>
          </div>
          <Popover offset={12} placement="bottom-start">
            <PopoverTrigger>
              <Button
                disableRipple
                isIconOnly
                className="overflow-visible"
                radius="full"
                variant="light"
              >
                <Badge color="danger" content={notificationsState[NotificationTabs.Unread].length} showOutline={false} size="md" isInvisible={!notificationsState[NotificationTabs.Unread].length}>
                  <Icon className="text-default-500" icon="solar:bell-linear" width={22} />
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
              <NotificationsCard notifications={notificationsState} className="w-full shadow-none" />
            </PopoverContent>
          </Popover>
        </div>
        <Spacer y={8} />
        <div className="flex items-center gap-3 px-3">
          <Avatar
            isBordered
            className="flex-none"
            size="sm"
          />
          <div className={cn("flex max-w-full flex-col", {hidden: isCompact})}>
            <p className="truncate text-small font-medium text-default-600">Mauricio Sanchez</p>
            <p className="truncate text-tiny text-default-400">Administrador</p>
          </div>
        </div>
        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} isCompact={isCompact} items={items} />
        </ScrollShadow>
        <Spacer y={2} />
        <div
          className={cn("mt-auto flex flex-col", {
            "items-center": isCompact,
          })}
        >
          <Tooltip content="Cerrar sesion" isDisabled={!isCompact} placement="right">
            <Button
              onPress={() => {
                Cookies.remove("token");
                router.push("/sign-in");
              }}
              className={cn("justify-start text-default-500 data-[hover=true]:text-foreground", {
                "justify-center": isCompact,
              })}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="flex-none rotate-180 text-default-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                )
              }
              variant="light"
            >
              {isCompact ? (
                <Icon
                  className="rotate-180 text-default-500"
                  icon="solar:minus-circle-line-duotone"
                  width={24}
                />
              ) : (
                "Cerrar sesion"
              )}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="w-full flex flex-1 flex-col p-4 gap-4">
        <main
          className="w-full flex-1 flex flex-col gap-4 rounded-medium border-small border-divider p-6 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;