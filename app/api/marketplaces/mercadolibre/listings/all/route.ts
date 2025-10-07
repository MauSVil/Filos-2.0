import { NextResponse } from 'next/server';
import clientPromise from '@/mongodb';

/**
 * GET /api/marketplaces/mercadolibre/listings/all
 * Obtiene todas las publicaciones activas en MercadoLibre
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    const listings = await collection
      .find({
        marketplace: 'mercadolibre',
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching all listings:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener publicaciones',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
