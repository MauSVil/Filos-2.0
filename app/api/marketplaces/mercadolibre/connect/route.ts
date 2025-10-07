import { NextResponse } from 'next/server';
import { MercadoLibreAuthService } from '@/services/marketplaces/mercadolibre/MercadoLibreAuthService';

/**
 * GET /api/marketplaces/mercadolibre/connect
 * Inicia el flujo de OAuth redirigiendo al usuario a MercadoLibre
 */
export async function GET() {
  try {
    const authUrl = MercadoLibreAuthService.getAuthorizationUrl();

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating MercadoLibre OAuth:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al conectar con MercadoLibre',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
