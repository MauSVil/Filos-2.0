'use client';

import { useModule } from '../_modules/useModule';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { TrendsList } from './TrendsList';
import { TrendDetails } from './TrendDetails';
import { StatsCards } from './StatsCards';
import { NextAnalysisCountdown } from './NextAnalysisCountdown';

const Content = () => {
  const { localData, flags, methods } = useModule();
  const { trendsList, selectedTrend, selectedTrendId, stats } = localData;

  // Loading state inicial
  if (flags.isLoadingList && trendsList.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (flags.isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tendencias de Suéteres</h1>
          <p className="text-muted-foreground">Análisis de mercado y productos populares</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las tendencias. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>

        <Button onClick={methods.refresh} variant="outline">
          <AlertCircle className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  // No trends available
  if (trendsList.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tendencias de Suéteres</h1>
          <p className="text-muted-foreground">Análisis de mercado y productos populares</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No hay análisis disponibles</CardTitle>
            <CardDescription>
              Aún no se han generado análisis de tendencias. Los análisis se generan automáticamente
              dos veces al mes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El próximo análisis se generará el día 1 o 15 del mes a las 2 AM.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Tendencias de Suéteres
            </h1>
            <NextAnalysisCountdown />
          </div>
          <p className="text-muted-foreground">
            Análisis de mercado y productos más buscados
          </p>
        </div>
        {flags.hasSelection && (
          <Button
            onClick={methods.clearSelection}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a lista
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Main Content */}
      {!flags.hasSelection ? (
        // Vista de lista
        <TrendsList
          trends={trendsList}
          onSelectTrend={methods.selectTrend}
          isLoading={flags.isLoadingList}
        />
      ) : (
        // Vista de detalles
        <TrendDetails
          trend={selectedTrend}
          isLoading={flags.isLoadingDetails}
          onBack={methods.clearSelection}
        />
      )}
    </div>
  );
};

export default Content;
