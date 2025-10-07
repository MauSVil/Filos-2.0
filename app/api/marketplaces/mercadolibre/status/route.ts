import { NextResponse } from 'next/server';
import { MercadoLibreAuthService } from '@/services/marketplaces/mercadolibre/MercadoLibreAuthService';
import clientPromise from '@/mongodb';

/**
 * GET /api/marketplaces/mercadolibre/status
 * Verifica el estado de conexión con MercadoLibre
 */
export async function GET() {
  try {
    const isConnected = await MercadoLibreAuthService.isConnected();

    if (!isConnected) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          account: null,
        },
      });
    }

    const account = await MercadoLibreAuthService.getConnectedAccount();

    // Obtener estadísticas de publicaciones
    const client = await clientPromise;
    const db = client.db('test');
    const listingsCollection = db.collection('marketplace_listings');

    const listingsCount = await listingsCollection.countDocuments({
      marketplace: 'mercadolibre',
      status: { $in: ['active', 'paused'] },
    });

    const activeListings = await listingsCollection.countDocuments({
      marketplace: 'mercadolibre',
      status: 'active',
    });

    // Calcular ventas del mes
    const ordersCollection = db.collection('marketplace_orders');
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const salesThisMonth = await ordersCollection.countDocuments({
      marketplace: 'mercadolibre',
      createdAt: { $gte: startOfMonth },
    });

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        account: {
          ...account,
          stats: {
            totalListings: listingsCount,
            activeListings,
            salesThisMonth,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error checking MercadoLibre status:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al verificar estado de conexión',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
