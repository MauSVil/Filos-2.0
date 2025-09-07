"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarAutoCollapse } from "@/hooks/use-sidebar-auto-collapse";
import { shouldAutoCollapsePage } from "@/config/sidebar-config";

interface SidebarProviderWithAutoCollapseProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function SidebarProviderWithAutoCollapse({
  children,
  style,
}: SidebarProviderWithAutoCollapseProps) {
  const pathname = usePathname();
  
  // Initialize with collapsed state if we're on an auto-collapse page
  const initialOpen = React.useMemo(() => {
    return !shouldAutoCollapsePage(pathname);
  }, [pathname]);
  
  const [open, setOpen] = React.useState(initialOpen);
  
  // Use the auto-collapse hook for navigation changes
  const { shouldAutoCollapse } = useSidebarAutoCollapse(setOpen, open);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      style={style}
    >
      {children}
    </SidebarProvider>
  );
}