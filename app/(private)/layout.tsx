"use client"

import Link from "next/link"
import {
  Bell,
  Home,
  LineChart,
  MessageCircle,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/cn"
import { NotificationType } from "@/types/MongoTypes/Notification"
import { useNotifications } from "./_hooks/useNotifications"
import { useEffect, useMemo, useState } from "react"
import { socket } from "./_socket"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Notifications from "@/components/layout/notifications"

interface Props {
  children: React.ReactNode
}

const PrivateLayout = (props: Props) => {
  const { children } = props;
  const [notificationsState, setNotificationsState] = useState<NotificationType[]>([])

  const pathname = usePathname();
  const currentPaths = pathname.split("/")
  const currentPath = currentPaths?.[1]

  console.log(currentPaths, 'currentPaths')

  const notifications = useNotifications();
  const notificationsData = useMemo(() => notifications?.data || [], [notifications.data]);

  useEffect(() => {
    setNotificationsState(notificationsData);
  }, [notificationsData.length, notifications.isFetching]);

  useEffect(() => {
    socket.on('new_notification', (notification: NotificationType) => {
      const audio = new Audio('/sounds/Notification.mp3');
      audio.volume = 0.8;
      audio.play();
      setNotificationsState((prevState) => {
        return [notification, ...prevState];
      });
    });

    return () => {
      socket.off('new_notification');
    };
  }, []);

  const onNotificationClick = (notification: NotificationType) => {
    notifications.refetch();
  }

  return (
    <div className="flex flex-1 w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                  "bg-accent": currentPath === ""
                })}
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
                href="/orders"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                  "bg-accent": currentPath === "orders"
                })}
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
                href="/products"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                  "bg-accent": currentPath === "products"
                })}
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
                href="/buyers"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                  "bg-accent": currentPath === "buyers"
                })}
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
                href="/chat"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                  "bg-accent": currentPath === "chat"
                })}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Chat</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Chat</TooltipContent>
          </Tooltip>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Popover>
            <PopoverTrigger>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                <Bell className="h-5 w-5" />
                {
                  notificationsState.filter((notification) => !notification.read).length > 0 && (
                    <div className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-xs font-semibold bg-blue-500 rounded-full text-primary">
                      {notificationsState.filter((notification) => !notification.read).length}
                    </div>
                  )
                }
                <span className="sr-only">Notificaciones</span>
              </div>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-[400px]" collisionPadding={50}>
              <Notifications notifications={notificationsState} onNotificationClick={onNotificationClick} />
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                  "bg-accent": currentPath === "settings"
                })}
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
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", {
                    "text-foreground": currentPath === ""
                  })}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/orders"
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", {
                    "text-foreground": currentPath === "orders"
                  })}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Ordenes
                </Link>
                <Link
                  href="/products"
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", {
                    "text-foreground": currentPath === "products"
                  })}
                >
                  <Package className="h-5 w-5" />
                  Productos
                </Link>
                <Link
                  href="/buyers"
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", {
                    "text-foreground": currentPath === "buyers"
                  })}
                >
                  <Users2 className="h-5 w-5" />
                  Compradores
                </Link>
                <Link
                  href="/chat"
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", {
                    "text-foreground": currentPath === "buyers"
                  })}
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {
                currentPaths?.length > 0 && currentPaths.slice(1).map((path, index) => (
                  <>
                    <BreadcrumbItem key={index}>
                      <BreadcrumbLink key={index} asChild>
                        <Link href="#">{path}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {
                      index + 1 < currentPaths.length - 1 && (
                        <BreadcrumbSeparator />
                      )
                    }
                  </>
                ))
              }
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="overflow-hidden flex-1 px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default PrivateLayout