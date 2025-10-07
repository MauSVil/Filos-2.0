'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ConnectionCard } from './ConnectionCard';
import { useMarketplacesModule } from '../_modules/useMarketplacesModule';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Content = () => {
  const { localData, flags } = useMarketplacesModule();
  const { isLoading, isError } = flags;
  const searchParams = useSearchParams();

  // Mostrar mensaje de éxito/error después del OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected === 'true') {
      toast.success('¡Cuenta conectada exitosamente!', {
        description: 'Ya puedes comenzar a publicar productos en MercadoLibre',
      });
      // Limpiar URL
      window.history.replaceState({}, '', '/marketplaces');
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        authorization_denied: 'Autorizació rechazada',
        missing_code: 'Código de autorización no recibido',
        callback_failed: 'Error al procesar la autorización',
      };

      toast.error('Error al conectar cuenta', {
        description: errorMessages[error] || 'Error desconocido',
      });
      // Limpiar URL
      window.history.replaceState({}, '', '/marketplaces');
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplaces</h1>
          <p className="text-muted-foreground">
            Gestiona tus integraciones con marketplaces
          </p>
        </div>

        <div className="grid gap-6">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplaces</h1>
          <p className="text-muted-foreground">
            Gestiona tus integraciones con marketplaces
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar la información de marketplaces. Por favor, intenta nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplaces</h1>
          <p className="text-muted-foreground">
            Conecta y gestiona tus integraciones con marketplaces externos
          </p>
        </div>

        {localData.isConnected && (
          <Button asChild variant="outline" className="gap-2">
            <Link href="/marketplaces/listings">
              <Package className="h-4 w-4" />
              Ver publicaciones
            </Link>
          </Button>
        )}
      </div>

      {/* MercadoLibre Connection Card */}
      <div className="grid gap-6">
        <ConnectionCard />
      </div>

      {/* Coming Soon */}
      {localData.isConnected && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Amazon - Coming Soon */}
          <div className="rounded-lg border-2 border-dashed p-6 opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <svg className="h-6 w-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.1.187 0 .293.1.293.3 0 .18-.062.315-.186.405-2.078 1.78-4.776 2.926-8.09 3.44-.508.076-1.014.106-1.52.106-3.95 0-7.474-1.156-10.572-3.467-.234-.174-.293-.315-.293-.5 0-.14.05-.25.145-.362.072-.085.146-.13.22-.13l.045.004z"/>
                  <path d="M21.953 16.654c-.272-.523-.854-.872-1.74-.872-.38 0-.847.07-1.402.21-.555.14-1.042.28-1.462.42l-.315.105c-.166.056-.28.084-.345.084-.138 0-.207-.084-.207-.252 0-.196.124-.364.372-.504 1.433-.81 2.538-1.358 3.315-1.645.777-.287 1.462-.43 2.055-.43 1.074 0 1.826.298 2.256.893.43.595.645 1.498.645 2.71 0 1.68-.496 3.058-1.487 4.134-.234.252-.468.378-.702.378-.138 0-.234-.042-.29-.126-.055-.084-.055-.196 0-.336.497-.99.745-2.24.745-3.75 0-1.288-.138-2.268-.414-2.94z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Amazon</h3>
                <p className="text-sm text-muted-foreground">Próximamente</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              La integración con Amazon estará disponible pronto.
            </p>
          </div>

          {/* Shopify - Coming Soon */}
          <div className="rounded-lg border-2 border-dashed p-6 opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.337 2.543c-.003.031-.013.055-.021.084l-1.486 4.493-2.306-6.855c-.022-.068-.072-.134-.142-.176a.323.323 0 0 0-.19-.055h-.002c-.061 0-.121.018-.173.053a.356.356 0 0 0-.124.139L9.41 4.107 8.172 7.425 6.36 1.654a.372.372 0 0 0-.13-.166.322.322 0 0 0-.187-.058h-4.24c-.09 0-.174.04-.232.108a.363.363 0 0 0-.077.25l2.454 18.188c.014.105.078.195.17.239.046.022.098.034.151.034.056 0 .111-.013.16-.038l7.797-4.002a.359.359 0 0 0 .174-.22l3.853-13.339c.019-.065.014-.137-.014-.198a.354.354 0 0 0-.102-.157z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Shopify</h3>
                <p className="text-sm text-muted-foreground">Próximamente</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              La integración con Shopify estará disponible pronto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
