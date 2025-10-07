'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MarketplaceAccount {
  meliUserId: string;
  nickname: string;
  email: string;
  siteId: string;
  connectedAt: string;
  metadata: {
    firstName: string;
    lastName: string;
    countryId: string;
    points: number;
    reputation: string;
  };
  stats: {
    totalListings: number;
    activeListings: number;
    salesThisMonth: number;
  };
}

interface MarketplaceStatus {
  connected: boolean;
  account: MarketplaceAccount | null;
}

export const useMarketplacesModule = () => {
  const queryClient = useQueryClient();

  // Query para obtener estado de MercadoLibre
  const {
    data: status,
    isLoading,
    isError,
    refetch,
  } = useQuery<MarketplaceStatus>({
    queryKey: ['mercadolibre-status'],
    queryFn: async () => {
      const response = await fetch('/api/marketplaces/mercadolibre/status');
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  // Mutation para conectar cuenta
  const connectMutation = useMutation({
    mutationFn: async () => {
      // Redirige al flujo OAuth
      window.location.href = '/api/marketplaces/mercadolibre/connect';
    },
  });

  // Mutation para desconectar cuenta
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/marketplaces/mercadolibre/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Cuenta de MercadoLibre desconectada');
      queryClient.invalidateQueries({ queryKey: ['mercadolibre-status'] });
    },
    onError: () => {
      toast.error('Error al desconectar cuenta');
    },
  });

  return {
    localData: {
      status,
      isConnected: status?.connected || false,
      account: status?.account || null,
    },
    flags: {
      isLoading,
      isError,
      isDisconnecting: disconnectMutation.isPending,
    },
    methods: {
      connect: connectMutation.mutate,
      disconnect: disconnectMutation.mutate,
      refresh: refetch,
    },
  };
};
