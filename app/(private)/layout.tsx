"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  ImagesIcon,
  LineChart,
  MessageCircle,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useNotifications } from "./_hooks/useNotifications";
import { socket } from "./_socket";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Notifications from "@/components/layout/notifications";
import { Notification } from "@/types/RepositoryTypes/Notification";

interface Props {
  children: React.ReactNode;
}

const PrivateLayout = (props: Props) => {
  const { children } = props;
  const [notificationsState, setNotificationsState] = useState<
  Notification[]
  >([]);

  const pathname = usePathname();
  const currentPaths = pathname.split("/");
  const currentPath = currentPaths?.[1];

  const notifications = useNotifications();
  const notificationsData = useMemo(
    () => notifications?.data || [],
    [notifications.data],
  );

  useEffect(() => {
    setNotificationsState(notificationsData);
  }, [notificationsData.length, notifications.isFetching]);

  useEffect(() => {
    socket.on("new_notification", (notification: Notification) => {
      const audio = new Audio("/sounds/Notification.mp3");

      audio.volume = 0.8;
      audio.play();
      setNotificationsState((prevState) => {
        return [notification, ...prevState];
      });
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  const onNotificationClick = (notification: Notification) => {
    notifications.refetch();
  };

  return (
    <div className="flex flex-1 w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "",
                  },
                )}
                href="/"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "orders",
                  },
                )}
                href="/orders"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Ordenes</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Ordenes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "products",
                  },
                )}
                href="/products"
              >
                <Package className="h-5 w-5" />
                <span className="sr-only">Productos</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Productos</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "buyers",
                  },
                )}
                href="/buyers"
              >
                <Users2 className="h-5 w-5" />
                <span className="sr-only">Compradores</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Compradores</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "chat",
                  },
                )}
                href="/chat"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Chat</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "catalogs",
                  },
                )}
                href="/catalogs"
              >
                <ImagesIcon className="h-5 w-5" />
                <span className="sr-only">Catalogos</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Catalogos</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "editPrices",
                  },
                )}
                href="/editPrices"
              >
                <ImagesIcon className="h-5 w-5" />
                <span className="sr-only">Editar Precios</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Editar Precios</TooltipContent>
          </Tooltip>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Popover>
            <PopoverTrigger>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                <Bell className="h-5 w-5" />
                {notificationsState.filter((notification) => !notification.read)
                  .length > 0 && (
                  <div className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-xs font-semibold bg-blue-500 rounded-full text-primary">
                    {
                      notificationsState.filter(
                        (notification) => !notification.read,
                      ).length
                    }
                  </div>
                )}
                <span className="sr-only">Notificaciones</span>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[400px]"
              collisionPadding={50}
              side="right"
            >
              <Notifications
                notifications={notificationsState}
                onNotificationClick={onNotificationClick}
              />
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  {
                    "bg-accent": currentPath === "settings",
                  },
                )}
                href="#"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
      <div className="flex justify-start flex-col min-h-screen sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="sm:hidden" size="icon" variant="outline">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xs" side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    {
                      "text-foreground": currentPath === "",
                    },
                  )}
                  href="/"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    {
                      "text-foreground": currentPath === "orders",
                    },
                  )}
                  href="/orders"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Ordenes
                </Link>
                <Link
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    {
                      "text-foreground": currentPath === "products",
                    },
                  )}
                  href="/products"
                >
                  <Package className="h-5 w-5" />
                  Productos
                </Link>
                <Link
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    {
                      "text-foreground": currentPath === "buyers",
                    },
                  )}
                  href="/buyers"
                >
                  <Users2 className="h-5 w-5" />
                  Compradores
                </Link>
                <Link
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    {
                      "text-foreground": currentPath === "buyers",
                    },
                  )}
                  href="/chat"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat
                </Link>
                <Link
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  href="#"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {currentPaths?.length > 0 &&
                currentPaths.slice(1).map((path, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <BreadcrumbItem key={index}>
                      <BreadcrumbLink key={index} asChild>
                        <Link href="#">{path}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index + 1 < currentPaths.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </div>
                ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="overflow-hidden flex-1 px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
