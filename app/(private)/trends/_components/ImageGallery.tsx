'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { SerperImage } from '@/types/v2/TrendImage.type';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ImageGalleryProps {
  keyword: string;
  title?: string;
}

export const ImageGallery = ({ keyword, title }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<SerperImage | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['trend-images', keyword],
    queryFn: async () => {
      const response = await fetch(`/api/trends/images?keyword=${encodeURIComponent(keyword)}&count=9`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const result = await response.json();
      return result.data as SerperImage[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Inspiración Visual
          </CardTitle>
          <CardDescription>Cargando imágenes de tendencias...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Inspiración Visual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se pudieron cargar imágenes para esta tendencia
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title || 'Inspiración Visual'}
          </CardTitle>
          <CardDescription>
            Imágenes actuales de "{keyword}" en tendencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-muted"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.thumbnailUrl || image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                </div>
                {image.domain && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{image.domain}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          {selectedImage && (
            <div className="space-y-4 p-4">
              <div className="relative w-full flex items-center justify-center bg-black/5 rounded-lg" style={{ minHeight: '400px' }}>
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback a thumbnail si falla la imagen principal
                    const target = e.target as HTMLImageElement;
                    if (selectedImage.thumbnailUrl && target.src !== selectedImage.thumbnailUrl) {
                      target.src = selectedImage.thumbnailUrl;
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedImage.domain && (
                    <Badge variant="outline">{selectedImage.domain}</Badge>
                  )}
                  {selectedImage.link && (
                    <a
                      href={selectedImage.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Ver fuente original
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dimensiones: {selectedImage.imageWidth} × {selectedImage.imageHeight}px
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
