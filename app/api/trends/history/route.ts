import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/mongodb';
import { TrendAggregatorService } from '@/services/trends/TrendAggregatorService';

/**
 * GET /api/trends/history
 * Obtiene el histórico de análisis de tendencias
 * Query params:
 *  - limit: número de registros a obtener (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const client = await clientPromise;
    const db = client.db('test');
    const aggregatorService = new TrendAggregatorService(db);

    const history = await aggregatorService.getTrendsHistory(limit);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching trends history:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener histórico de tendencias',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
