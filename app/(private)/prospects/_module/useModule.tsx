"use client";

import { useState, useEffect } from "react";
import { SortingState } from "@tanstack/react-table";
import { Prospect } from "@/types/RepositoryTypes/Prospect";

export const useModule = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch prospects
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/prospects");
        if (!response.ok) {
          throw new Error("Failed to fetch prospects");
        }
        const data = await response.json();
        setProspects(data);
      } catch (error) {
        console.error("Error fetching prospects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProspects();
  }, []);

  return {
    methods: {
      setSorting,
      setProspects,
    },
    localData: {
      prospects,
      sorting,
    },
    flags: {
      isLoading,
    },
  };
};
