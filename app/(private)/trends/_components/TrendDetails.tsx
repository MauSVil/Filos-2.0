'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Image as ImageIcon,
  Search,
  ArrowUp,
  ArrowDown,
  Star,
  ExternalLink,
} from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

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
  value: number;
  type: 'top' | 'rising';
  growth?: string;
  images: ProductImage[];
}

interface TrendAnalysis {
  _id: string;
  date: string;
  timestamp: string;
  category: string;
  topTermsWithImages: TermWithImages[];
  imageStats: {
    totalTermsSearched: number;
    totalImagesFound: number;
    termsWithImages: number;
    termsWithoutImages: number;
  };
  relatedQueries: {
    top: any[];
    rising: any[];
  };
}

interface TrendDetailsProps {
  trend: TrendAnalysis | null;
  isLoading: boolean;
  onBack: () => void;
}

export const TrendDetails = ({ trend, isLoading }: TrendDetailsProps) => {
  if (isLoading || !trend) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Ordenar términos por valor (interés)
  const sortedTerms = [...trend.topTermsWithImages].sort((a, b) => b.value - a.value);

  // Filtrar términos que tienen imágenes
  const termsWithImages = sortedTerms.filter(t => t.images.length > 0);

  // Top 3 términos
  const topTerms = sortedTerms.slice(0, 3);

  // Términos emergentes (rising con growth)
  const risingTerms = trend.topTermsWithImages
    .filter((t) => t.type === 'rising' && t.growth)
    .sort((a, b) => {
      const growthA = parseInt(a.growth?.replace('%', '') || '0');
      const growthB = parseInt(b.growth?.replace('%', '') || '0');
      return growthB - growthA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top 3 Términos Destacados */}
      {topTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top 3 Términos Más Populares
            </CardTitle>
            <CardDescription>Los términos con mayor nivel de interés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {topTerms.map((term, index) => (
                <Card key={index} className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <Badge variant="outline">{term.value}/100</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg capitalize">{term.query}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Términos Emergentes */}
      {risingTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Términos Emergentes
            </CardTitle>
            <CardDescription>Tendencias con mayor crecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risingTerms.map((term, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <ArrowUp className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium capitalize">{term.query}</h4>
                  </div>
                  <Badge variant="default" className="text-sm">
                    +{term.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos los Términos Analizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Todas las Tendencias Analizadas
          </CardTitle>
          <CardDescription>
            {sortedTerms.length} términos ordenados por nivel de interés • Los primeros {sortedTerms.filter(t => t.images.length > 0).length} tienen productos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTerms.map((term, index) => {
              const hasImages = term.images.length > 0;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    hasImages
                      ? 'bg-card hover:bg-accent/50 cursor-pointer'
                      : 'bg-muted/30 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm flex-shrink-0 ${
                      hasImages ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium capitalize truncate">{term.query}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {term.value}/100
                        </Badge>
                        {term.growth && (
                          <Badge variant="secondary" className="text-xs">
                            +{term.growth}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Galería de Imágenes por Término */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Productos por Término de Búsqueda
          </CardTitle>
          <CardDescription>
            Explora los productos encontrados para cada término analizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={termsWithImages[0]?.query || 'all'} className="w-full">
            <div className="border-b mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
              <TabsList className="bg-transparent h-auto p-0 gap-1 inline-flex w-auto">
                {termsWithImages.map((term) => (
                  <TabsTrigger
                    key={term.query}
                    value={term.query}
                    className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-t-md rounded-b-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap"
                  >
                    {term.query}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {termsWithImages.map((term) => (
              <TabsContent key={term.query} value={term.query} className="mt-0">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {term.images.map((image, idx) => (
                      <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow h-[340px] flex flex-col">
                        <div className="relative w-full h-[200px] bg-muted flex-shrink-0">
                          <img
                            src={image.thumbnail}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-3 flex-1 flex flex-col min-h-0">
                          <h4 className="font-medium line-clamp-2 text-xs leading-tight mb-2 flex-shrink-0">
                            {image.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs mb-1 flex-shrink-0">
                            <span className="text-muted-foreground text-xs truncate max-w-[60%]">
                              {image.shop}
                            </span>
                            {image.price && (
                              <span className="font-bold text-primary text-xs whitespace-nowrap">{image.price}</span>
                            )}
                          </div>
                          {image.rating && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 flex-shrink-0">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{image.rating}</span>
                              {image.reviews && (
                                <span className="text-muted-foreground">({image.reviews})</span>
                              )}
                            </div>
                          )}
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-auto flex-shrink-0"
                          >
                            Ver producto <ExternalLink className="h-3 w-3" />
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
