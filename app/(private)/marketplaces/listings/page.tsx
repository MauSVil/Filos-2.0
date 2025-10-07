'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Package, ExternalLink, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import numeral from 'numeral';
import Image from 'next/image';
import Link from 'next/link';

interface Listing {
  _id: string;
  productId: string;
  marketplace: string;
  externalId: string;
  sku: string;
  permalink: string;
  status: string;
  categoryId: string;
  listingType: string;
  price: number;
  availableQuantity: number;
  soldQuantity: number;
  createdAt: string;
  lastSync: string;
  metadata: {
    title: string;
    pictures: string[];
    attributes: Array<{ id: string; value_name: string }>;
    shippingMode: string;
    condition: string;
  };
}

export default function MarketplaceListingsPage() {
  const queryClient = useQueryClient();

  const { data: listings, isLoading, refetch, isFetching } = useQuery<Listing[]>({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      // Primero sincronizar con MercadoLibre
      try {
        await fetch('/api/marketplaces/mercadolibre/listings/sync-all', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Sync failed:', error);
      }

      // Luego obtener de la base de datos local
      const response = await fetch('/api/marketplaces/mercadolibre/listings/all');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const result = await response.json();
      return result.data;
    },
    staleTime: 30000, // 30 segundos
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await fetch(`/api/marketplaces/mercadolibre/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Error al eliminar');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Publicación eliminada', {
        description: 'La publicación ha sido cerrada en MercadoLibre y eliminada',
      });
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar', {
        description: error.message,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'closed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'paused':
        return 'Pausada';
      case 'closed':
        return 'Cerrada';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/marketplaces">Marketplaces</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Publicaciones</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Publicaciones en Marketplaces</h1>
              <p className="text-muted-foreground text-lg">
                Gestiona tus productos publicados en MercadoLibre
              </p>
            </div>
          </div>

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !listings || listings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes publicaciones activas</p>
              <Button asChild className="mt-4">
                <Link href="/products">Ir a productos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">
                      {listing.metadata.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      SKU: {listing.sku}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(listing.status)}>
                    {getStatusText(listing.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Image */}
                {listing.metadata.pictures && listing.metadata.pictures.length > 0 && (
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted/30">
                    <Image
                      alt={listing.metadata.title}
                      className="w-full h-full object-cover"
                      height={300}
                      width={300}
                      src={listing.metadata.pictures[0]}
                      unoptimized
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="text-lg font-bold">{numeral(listing.price).format('$0,0.00')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="text-lg font-bold">{listing.availableQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendidos</p>
                    <p className="text-lg font-bold text-green-500">{listing.soldQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="text-xs font-mono">{listing.categoryId}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <a href={listing.permalink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver en ML
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link href={`/products/${listing.productId}`}>
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('¿Cerrar esta publicación en MercadoLibre?')) {
                        deleteMutation.mutate(listing.externalId);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
