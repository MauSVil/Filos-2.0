"use client";

import { useState, useEffect } from "react";
import { SortingState } from "@tanstack/react-table";
import { ThreadPrice } from "@/types/RepositoryTypes/ThreadPrice";

export const useModule = () => {
  const [threadPrices, setThreadPrices] = useState<ThreadPrice[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch thread prices
  useEffect(() => {
    const fetchThreadPrices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/thread-prices");
        if (!response.ok) {
          throw new Error("Failed to fetch thread prices");
        }
        const data = await response.json();
        setThreadPrices(data);
      } catch (error) {
        console.error("Error fetching thread prices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadPrices();
  }, []);

  return {
    methods: {
      setSorting,
      setDialogOpen,
    },
    localData: {
      threadPrices,
      sorting,
      dialogOpen,
    },
    flags: {
      isLoading,
    },
  };
};
