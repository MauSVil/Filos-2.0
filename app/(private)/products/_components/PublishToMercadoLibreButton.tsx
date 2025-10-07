'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/RepositoryTypes/Product';
import numeral from 'numeral';

interface PublishToMercadoLibreButtonProps {
  product: Product;
}

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  quantity: number;
  condition: 'new' | 'used';
  listingType: string;
  freeShipping: boolean;
  localPickup: boolean;
  // Atributos
  brand: string;
  material: string;
  style: string;
  sleeveLength: string;
  season: string;
}

export const PublishToMercadoLibreButton = ({ product }: PublishToMercadoLibreButtonProps) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<ListingFormData>({
    title: `${product.name} - ${product.color} - Talla ${product.size}`.substring(0, 60),
    description: `${product.name}\nColor: ${product.color}\nTalla: ${product.size}\n\nProducto de calidad premium.`,
    price: product.webPagePrice,
    quantity: product.quantity,
    condition: 'new',
    listingType: 'gold_special',
    freeShipping: false,
    localPickup: true,
    brand: 'Filos',
    material: 'Algodón',
    style: 'Casual',
    sleeveLength: 'Larga',
    season: 'Todas',
  });

  // Check if product is already listed
  const { data: listings, isLoading: isCheckingListing } = useQuery({
    queryKey: ['mercadolibre-listing', product._id],
    queryFn: async () => {
      const response = await fetch(`/api/marketplaces/mercadolibre/listings?productId=${product._id}`);
      if (!response.ok) throw new Error('Failed to check listing');
      const result = await response.json();

      // Si hay listings, sincronizar el status de cada uno
      if (result.data && result.data.length > 0) {
        await Promise.all(
          result.data.map(async (listing: any) => {
            if (listing.externalId) {
              try {
                await fetch(`/api/marketplaces/mercadolibre/listings/sync`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ listingId: listing.externalId }),
                });
              } catch (error) {
                console.error('Failed to sync listing:', error);
              }
            }
          })
        );

        // Re-fetch después de sincronizar
        const syncedResponse = await fetch(`/api/marketplaces/mercadolibre/listings?productId=${product._id}`);
        const syncedResult = await syncedResponse.json();
        return syncedResult.data;
      }

      return result.data;
    },
    enabled: showPreviewModal, // Only check when modal opens
  });

  // Mutation to create listing
  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/marketplaces/mercadolibre/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          listingData: formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al publicar');
      }

      return result.data;
    },
    onSuccess: (data) => {
      toast.success('¡Producto publicado en MercadoLibre!', {
        description: 'Ya puedes ver tu publicación en MercadoLibre',
        action: {
          label: 'Ver publicación',
          onClick: () => window.open(data.permalink, '_blank'),
        },
      });
      queryClient.invalidateQueries({ queryKey: ['mercadolibre-listing', product._id] });
      setShowPreviewModal(false);
    },
    onError: (error: Error) => {
      toast.error('Error al publicar', {
        description: error.message,
      });
    },
  });

  const activeListing = listings?.find((l: any) => l.status === 'active' || l.status === 'paused');

  const handlePublish = () => {
    if (!activeListing) {
      publishMutation.mutate();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={(e) => {
          e.stopPropagation();
          setShowPreviewModal(true);
        }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z"
            fill="#FFE600"
          />
        </svg>
        Publicar en ML
      </Button>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z"
                  fill="#FFE600"
                />
              </svg>
              Publicar en MercadoLibre
            </DialogTitle>
            <DialogDescription>
              {activeListing
                ? 'Este producto ya está publicado en MercadoLibre'
                : 'Revisa la información antes de publicar'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isCheckingListing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeListing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Publicación activa</p>
                    <p className="text-xs text-muted-foreground">
                      {activeListing.metadata.title}
                    </p>
                  </div>
                  <Badge variant={activeListing.status === 'active' ? 'default' : 'secondary'}>
                    {activeListing.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="text-lg font-semibold">{numeral(activeListing.price).format('$0,0.00')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="text-lg font-semibold">{activeListing.availableQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendidos</p>
                    <p className="text-lg font-semibold">{activeListing.soldQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="text-sm font-mono">{activeListing.categoryId}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(activeListing.permalink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver publicación en MercadoLibre
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePublish(); }}>
                {/* Información básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Información básica</h3>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value.substring(0, 60) })}
                      maxLength={60}
                      placeholder="Título de la publicación"
                    />
                    <p className="text-xs text-muted-foreground">{formData.title.length}/60 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Describe tu producto..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Stock *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        min={0}
                      />
                    </div>
                  </div>
                </div>

                {/* Atributos del producto */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Atributos del producto</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Ej: Filos"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Select
                        value={formData.material}
                        onValueChange={(value) => setFormData({ ...formData, material: value })}
                      >
                        <SelectTrigger id="material">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Algodón">Algodón</SelectItem>
                          <SelectItem value="Poliéster">Poliéster</SelectItem>
                          <SelectItem value="Lana">Lana</SelectItem>
                          <SelectItem value="Mezcla">Mezcla</SelectItem>
                          <SelectItem value="Lycra">Lycra</SelectItem>
                          <SelectItem value="Seda">Seda</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="style">Estilo</Label>
                      <Select
                        value={formData.style}
                        onValueChange={(value) => setFormData({ ...formData, style: value })}
                      >
                        <SelectTrigger id="style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Casual">Casual</SelectItem>
                          <SelectItem value="Formal">Formal</SelectItem>
                          <SelectItem value="Deportivo">Deportivo</SelectItem>
                          <SelectItem value="Elegante">Elegante</SelectItem>
                          <SelectItem value="Urbano">Urbano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sleeveLength">Largo de manga</Label>
                      <Select
                        value={formData.sleeveLength}
                        onValueChange={(value) => setFormData({ ...formData, sleeveLength: value })}
                      >
                        <SelectTrigger id="sleeveLength">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sin mangas">Sin mangas</SelectItem>
                          <SelectItem value="Corta">Corta</SelectItem>
                          <SelectItem value="3/4">3/4</SelectItem>
                          <SelectItem value="Larga">Larga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="season">Temporada</Label>
                      <Select
                        value={formData.season}
                        onValueChange={(value) => setFormData({ ...formData, season: value })}
                      >
                        <SelectTrigger id="season">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Todas">Todas las temporadas</SelectItem>
                          <SelectItem value="Primavera/Verano">Primavera/Verano</SelectItem>
                          <SelectItem value="Otoño/Invierno">Otoño/Invierno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Envío y logística */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Envío y logística</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="freeShipping"
                        checked={formData.freeShipping}
                        onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="freeShipping" className="cursor-pointer">Envío gratis</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="localPickup"
                        checked={formData.localPickup}
                        onChange={(e) => setFormData({ ...formData, localPickup: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="localPickup" className="cursor-pointer">Retiro en persona</Label>
                    </div>
                  </div>
                </div>

                {formData.quantity === 0 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-500">
                      Este producto no tiene stock disponible
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            {!activeListing && (
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending || product.quantity === 0}
                className="w-full sm:w-auto"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar ahora'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
