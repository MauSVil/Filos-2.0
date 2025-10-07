import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/mongodb';
import { TrendAggregatorService } from '@/services/trends/TrendAggregatorService';

/**
 * POST /api/trends/generate
 * Genera un nuevo análisis de tendencias (borra cache anterior)
 */
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const aggregatorService = new TrendAggregatorService(db);
    const trendsCollection = db.collection('trends');

    // 1. Borrar cache anterior para forzar regeneración
    await trendsCollection.deleteMany({});
    console.log('Previous cache cleared');

    // 2. Generar nuevo análisis
    const trends = await aggregatorService.generateTrends();

    return NextResponse.json({
      success: true,
      data: trends,
      message: 'Análisis de tendencias generado exitosamente',
    });
  } catch (error) {
    console.error('Error generating trends:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al generar análisis de tendencias',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
