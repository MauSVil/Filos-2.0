"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconShoppingBag,
  IconFileBarcode
} from "@tabler/icons-react"

import { NavReports } from "@/components/nav-reports"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { NavAI } from "@/components/nav-ai"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Productos",
      url: "/products",
      icon: IconListDetails,
    },
    {
      title: 'Compradores',
      url: "/buyers",
      icon: IconShoppingBag,
    },
    {
      title: "Ordenes",
      url: "/orders",
      icon: IconChartBar,
    },
    {
      title: 'Generador de Guias',
      url: "/guides",
      icon: IconFileBarcode,
    }
  ],
  navAI: [
    {
      title: "Nano-Banana IA",
      icon: IconFileAi,
      url: "/ai/nano-banana",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  reports: [
    {
      name: "Productos vendidos",
      url: "products-sold",
      icon: IconDatabase,
    },
    {
      name: "Compradores frecuentes",
      url: "frequent-buyers",
      icon: IconReport,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Filos</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAI items={data.navAI} />
        <NavReports items={data.reports} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
