import { SidebarItem } from "@/components/layout/sidebar"

export const items: SidebarItem[] = [
  {
    key: "home",
    href: "/",
    icon: "solar:home-2-linear",
    title: "Home",
  },
  {
    key: "products",
    href: "/products",
    icon: "solar:list-check-linear",
    title: "Productos",
  },
  {
    key: "buyers",
    href: "/buyers",
    icon: "healthicons:people-outline",
    title: "Compradores",
  },
  {
    key: "orders",
    href: "/orders",
    icon: "solar:bill-list-linear",
    title: "Ordenes",
  },
  {
    key: "chat",
    href: "/chat",
    icon: "solar:chat-line-linear",
    title: "Chat",
  },
]