import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/mongodb';
import { TrendAggregatorService } from '@/services/trends/TrendAggregatorService';

/**
 * GET /api/trends/latest
 * Obtiene el último análisis de tendencias disponible
 * Si no hay uno reciente (< 24h), genera uno nuevo
 */
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const aggregatorService = new TrendAggregatorService(db);

    // Intentar obtener tendencias existentes o generar nuevas
    const trends = await aggregatorService.getTrendsOrGenerate();

    if (!trends) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No se encontraron análisis de tendencias',
            devMessage: 'No trends found in database',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Error fetching latest trends:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener análisis de tendencias',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
