"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ModalContainer from 'react-modal-promise';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

export interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient()

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster richColors />
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ModalContainer />
          {children}
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
