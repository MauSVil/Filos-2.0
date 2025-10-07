'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendDocument } from '@/types/v2/Trend.type';

export const useModule = () => {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch latest trends
  const {
    data: trendsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trends', 'latest'],
    queryFn: async () => {
      const response = await fetch('/api/trends/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }
      const result = await response.json();
      return result.data as TrendDocument;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  // Generate new trends mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await fetch('/api/trends/generate', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate trends');
      }
      const result = await response.json();
      return result.data as TrendDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerateTrends = () => {
    generateMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    localData: {
      trends: trendsData,
    },
    flags: {
      isLoading: isLoading || isGenerating,
      isError,
      isGenerating,
    },
    methods: {
      generateTrends: handleGenerateTrends,
      refresh: handleRefresh,
    },
    error,
  };
};
