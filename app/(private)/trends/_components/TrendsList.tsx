'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image, TrendingUp, ChevronRight } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface TrendListItem {
  _id: string;
  date: string;
  timestamp: string;
  category: string;
  imageStats: {
    totalTermsSearched: number;
    totalImagesFound: number;
    termsWithImages: number;
    termsWithoutImages: number;
  };
}

interface TrendsListProps {
  trends: TrendListItem[];
  onSelectTrend: (trendId: string) => void;
  isLoading: boolean;
}

export const TrendsList = ({ trends, onSelectTrend, isLoading }: TrendsListProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Análisis Disponibles
        </h2>
        <p className="text-muted-foreground mt-1">
          Selecciona un análisis para ver los detalles completos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend, index) => {
          const isRecent = index === 0;

          return (
            <Card
              key={trend._id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                isRecent ? 'border-primary/50 bg-primary/5' : ''
              }`}
              onClick={() => onSelectTrend(trend._id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">
                      {moment(trend.date).format('DD MMMM YYYY')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {moment(trend.timestamp).format('HH:mm')}
                    </CardDescription>
                  </div>
                  {isRecent && (
                    <Badge variant="default" className="text-xs">
                      Reciente
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline" className="text-xs capitalize">
                    {trend.category}
                  </Badge>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Términos</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {trend.imageStats.totalTermsSearched}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Image className="h-4 w-4" />
                        <span className="text-xs">Imágenes</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {trend.imageStats.totalImagesFound}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {trend.imageStats.termsWithImages} con imágenes
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
