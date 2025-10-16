'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ky from 'ky';

// Tipos basados en la estructura de MongoDB trends_results
interface ProductImage {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  price?: string;
  shop?: string;
  rating?: number;
  reviews?: number;
  position?: number;
}

interface TermWithImages {
  query: string;
  value: number; // Interés 0-100
  type: 'top' | 'rising';
  growth?: string;
  images: ProductImage[];
}

interface ImageStats {
  totalTermsSearched: number;
  totalImagesFound: number;
  termsWithImages: number;
  termsWithoutImages: number;
}

interface RelatedQuery {
  query: string;
  value: number;
  type: 'top' | 'rising';
  growth?: string;
}

interface TrendAnalysis {
  _id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  category: string; // "suéteres"
  topTermsWithImages: TermWithImages[];
  imageStats: ImageStats;
  trendingSearches?: any[];
  relatedQueries: {
    top: RelatedQuery[];
    rising: RelatedQuery[];
  };
  metadata?: {
    searchesUsed: number;
    generatedAt: Date;
  };
}

interface TrendListItem {
  _id: string;
  date: string;
  timestamp: string;
  category: string;
  imageStats: ImageStats;
}

export const useModule = () => {
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);

  // Query 1: Lista de todos los análisis (metadatos)
  const trendsListQuery = useQuery<{ success: boolean; data: TrendListItem[]; count: number }>({
    queryKey: ['trends', 'list'],
    queryFn: async () => {
      return await ky.get('/api/trends').json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query 2: Detalles de un análisis específico
  const trendDetailsQuery = useQuery<{ success: boolean; data: TrendAnalysis }>({
    queryKey: ['trends', 'detail', selectedTrendId],
    queryFn: async () => {
      if (!selectedTrendId) throw new Error('No trend selected');
      return await ky.get(`/api/trends/${selectedTrendId}`).json();
    },
    enabled: !!selectedTrendId,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query 3: Estadísticas generales
  const statsQuery = useQuery<{
    success: boolean;
    data: {
      totalAnalyses: number;
      firstAnalysis: string | null;
      latestAnalysis: string | null;
      totalImages: number;
      totalTerms: number;
      averageImagesPerAnalysis: number;
    };
  }>({
    queryKey: ['trends', 'stats'],
    queryFn: async () => {
      return await ky.get('/api/trends/stats').json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Métodos
  const handleSelectTrend = (trendId: string) => {
    setSelectedTrendId(trendId);
  };

  const handleClearSelection = () => {
    setSelectedTrendId(null);
  };

  const handleRefresh = () => {
    trendsListQuery.refetch();
    if (selectedTrendId) {
      trendDetailsQuery.refetch();
    }
    statsQuery.refetch();
  };

  return {
    localData: {
      trendsList: trendsListQuery.data?.data || [],
      selectedTrend: trendDetailsQuery.data?.data || null,
      selectedTrendId,
      stats: statsQuery.data?.data || null,
    },
    flags: {
      isLoadingList: trendsListQuery.isLoading,
      isLoadingDetails: trendDetailsQuery.isLoading,
      isLoadingStats: statsQuery.isLoading,
      isError: trendsListQuery.isError || trendDetailsQuery.isError || statsQuery.isError,
      hasSelection: !!selectedTrendId,
    },
    methods: {
      selectTrend: handleSelectTrend,
      clearSelection: handleClearSelection,
      refresh: handleRefresh,
    },
  };
};
