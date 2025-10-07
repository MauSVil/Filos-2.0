import { NextRequest, NextResponse } from 'next/server';
import { MercadoLibreListingService } from '@/services/marketplaces/mercadolibre/MercadoLibreListingService';

/**
 * POST /api/marketplaces/mercadolibre/listings/sync
 * Sincroniza el status de una publicación desde MercadoLibre
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Listing ID es requerido',
            devMessage: 'Missing required parameter: listingId',
          },
        },
        { status: 400 }
      );
    }

    const syncedListing = await MercadoLibreListingService.syncListingStatus(listingId);

    return NextResponse.json({
      success: true,
      data: syncedListing,
      message: 'Publicación sincronizada exitosamente',
    });
  } catch (error) {
    console.error('Error syncing listing:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al sincronizar publicación',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
