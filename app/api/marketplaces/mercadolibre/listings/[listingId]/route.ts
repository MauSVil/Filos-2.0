import { NextRequest, NextResponse } from 'next/server';
import { MercadoLibreListingService } from '@/services/marketplaces/mercadolibre/MercadoLibreListingService';
import clientPromise from '@/mongodb';

/**
 * DELETE /api/marketplaces/mercadolibre/listings/[listingId]
 * Cierra una publicación en MercadoLibre y la elimina de la base de datos local
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await context.params;

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

    // Cerrar en MercadoLibre
    try {
      await MercadoLibreListingService.deleteListing(listingId);
      console.log(`✅ Listing ${listingId} closed in MercadoLibre`);
    } catch (error) {
      console.error(`⚠️ Failed to close listing in ML:`, error);
      // Continuar de todos modos para eliminar localmente
    }

    // Eliminar de la base de datos local
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    await collection.deleteOne({ externalId: listingId });
    console.log(`🗑️ Listing ${listingId} deleted from local database`);

    return NextResponse.json({
      success: true,
      message: 'Publicación cerrada y eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al eliminar publicación',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
