"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AUTO_COLLAPSE_PAGES, shouldAutoCollapsePage } from "@/config/sidebar-config";

export function useSidebarAutoCollapse(setOpen: (open: boolean) => void, currentOpen: boolean) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Skip initial render to avoid flickering
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      previousPath.current = pathname;
      return;
    }

    // Check if we're navigating to a different route
    if (pathname !== previousPath.current) {
      const shouldCollapse = shouldAutoCollapsePage(pathname);
      const wasCollapsePageBefore = previousPath.current ? shouldAutoCollapsePage(previousPath.current) : false;
      
      // Only auto-collapse when navigating TO an auto-collapse page from a non-auto-collapse page
      if (shouldCollapse && !wasCollapsePageBefore) {
        setOpen(false);
      }

      previousPath.current = pathname;
    }
  }, [pathname, setOpen]); // Remove currentOpen from dependencies to avoid re-running on state changes

  return {
    shouldAutoCollapse: shouldAutoCollapsePage(pathname),
    autoCollapsePages: AUTO_COLLAPSE_PAGES,
  };
}