import { NextResponse } from 'next/server';
import { MercadoLibreAuthService } from '@/services/marketplaces/mercadolibre/MercadoLibreAuthService';

/**
 * POST /api/marketplaces/mercadolibre/disconnect
 * Desconecta la cuenta de MercadoLibre
 */
export async function POST() {
  try {
    await MercadoLibreAuthService.disconnect();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Cuenta de MercadoLibre desconectada exitosamente',
      },
    });
  } catch (error) {
    console.error('Error disconnecting MercadoLibre:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al desconectar cuenta de MercadoLibre',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
