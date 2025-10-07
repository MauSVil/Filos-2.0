'use client';

import { useModule } from "../_modules/useModule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  Sparkles,
  Palette,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import moment from "moment";
import { ImageGallery } from "./ImageGallery";

const Content = () => {
  const { localData, flags, methods } = useModule();
  const { trends } = localData;

  // Loading state
  if (flags.isLoading && !trends) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

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

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (flags.isError || !trends) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tendencias de Moda</h1>
          <p className="text-muted-foreground">Descubre qué está de moda en el mercado de suéteres</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las tendencias. Por favor, intenta generar un nuevo análisis.
          </AlertDescription>
        </Alert>

        <Button onClick={methods.generateTrends} disabled={flags.isGenerating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${flags.isGenerating ? 'animate-spin' : ''}`} />
          {flags.isGenerating ? 'Generando...' : 'Generar Análisis'}
        </Button>
      </div>
    );
  }

  const { insights, sources, generatedAt, status } = trends;

  // Get top rising keyword
  const topRising = sources.googleTrends?.keywords
    ?.filter(k => k.growth > 0)
    .sort((a, b) => b.growth - a.growth)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tendencias de Moda</h1>
          <p className="text-muted-foreground">
            Descubre qué está de moda en el mercado de suéteres
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Actualizado {moment(generatedAt).fromNow()}
          </Badge>
          <Button
            onClick={methods.generateTrends}
            disabled={flags.isGenerating}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${flags.isGenerating ? 'animate-spin' : ''}`} />
            {flags.isGenerating ? 'Generando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Hero Section - Top Trending */}
      {topRising && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Tendencia Principal del Momento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-3xl font-bold capitalize">{topRising.term}</p>
                <p className="text-sm text-muted-foreground">El estilo más buscado actualmente</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-lg px-4 py-2">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  +{topRising.growth}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación de Tendencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.trendScore}/100</div>
            <p className="text-xs text-muted-foreground">
              {insights.trendScore > 70 ? 'Alta actividad' : insights.trendScore > 40 ? 'Actividad moderada' : 'Baja actividad'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Búsquedas Activas</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topKeywords.length}</div>
            <p className="text-xs text-muted-foreground">Términos populares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estilos en Ascenso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.risingStyles.length}</div>
            <p className="text-xs text-muted-foreground">Con crecimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colores de Moda</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.popularColors.filter(c => c !== 'No detectado').length}</div>
            <p className="text-xs text-muted-foreground">Más mencionados</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Búsquedas Más Populares
            </CardTitle>
            <CardDescription>Lo que más está buscando la gente en internet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.topKeywords.slice(0, 8).map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="capitalize">{keyword}</span>
                  </div>
                  {sources.googleTrends?.keywords && (
                    <Badge variant="secondary">
                      {sources.googleTrends.keywords.find(k => k.term === keyword)?.value || 0} búsquedas
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rising Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estilos en Crecimiento
            </CardTitle>
            <CardDescription>Suéteres que cada vez buscan más personas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.risingStyles.map((style, index) => {
                const keyword = sources.googleTrends?.keywords?.find(k => k.term === style);
                const growth = keyword?.growth || 0;

                return (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                    <div className="flex items-center gap-2">
                      {growth > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : growth < 0 ? (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{style}</span>
                    </div>
                    {growth !== 0 && (
                      <Badge variant={growth > 0 ? "default" : "secondary"}>
                        {growth > 0 ? '+' : ''}{growth}%
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recomendaciones para tu Negocio
          </CardTitle>
          <CardDescription>Qué productos deberías considerar comprar o fabricar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <div className="mt-0.5">
                  {recommendation.includes('Considera aumentar') && (
                    <Badge variant="default" className="text-xs">✅ Aumentar</Badge>
                  )}
                  {recommendation.includes('declive') && (
                    <Badge variant="secondary" className="text-xs">⚠️ Alerta</Badge>
                  )}
                  {recommendation.includes('Oportunidad') && (
                    <Badge variant="outline" className="text-xs">🎯 Oportunidad</Badge>
                  )}
                </div>
                <p className="text-sm flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Colors */}
      {insights.popularColors.filter(c => c !== 'No detectado').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colores de Moda
            </CardTitle>
            <CardDescription>Los colores que más están buscando en suéteres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.popularColors
                .filter(c => c !== 'No detectado')
                .map((color, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {color}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reddit Community Insights - Deshabilitado */}

      {/* Image Galleries for Top 3 Keywords */}
      <div className="space-y-4">
        {(() => {
          if (!sources.googleTrends?.keywords) return null;

          // 1. Obtener la tendencia principal (mayor crecimiento)
          const topTrending = sources.googleTrends.keywords
            .filter(k => k.growth > 0)
            .sort((a, b) => b.growth - a.growth)[0];

          // 2. Obtener top 2 por volumen de búsquedas (excluyendo la tendencia principal)
          const topByVolume = sources.googleTrends.keywords
            .filter(k => k.term !== topTrending?.term)
            .sort((a, b) => b.value - a.value)
            .slice(0, 2);

          // 3. Combinar: Tendencia principal + Top 2
          const keywordsToShow = topTrending
            ? [topTrending, ...topByVolume]
            : topByVolume;

          return keywordsToShow.map((keywordData, index) => (
            <ImageGallery
              key={keywordData.term}
              keyword={keywordData.term}
              title={
                index === 0 && topTrending?.term === keywordData.term
                  ? `🔥 Tendencia Principal: ${keywordData.term}`
                  : `Inspiración Visual: ${keywordData.term}`
              }
            />
          ));
        })()}
      </div>
    </div>
  );
};

export default Content;
