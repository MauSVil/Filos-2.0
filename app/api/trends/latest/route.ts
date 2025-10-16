import { NextResponse } from 'next/server';
import clientPromise from '@/mongodb';

/**
 * GET /api/trends/latest
 * Obtiene el análisis de tendencias más reciente
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     date: "2025-10-16",
 *     timestamp: "2025-10-16T02:23:14.756Z",
 *     category: "suéteres",
 *     topTermsWithImages: [...],
 *     imageStats: {...},
 *     trendingSearches: [...],
 *     relatedQueries: {...}
 *   }
 * }
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('trends_results');

    // Obtener el más reciente ordenando por fecha descendente
    const trend = await collection.findOne(
      {},
      {
        projection: { _id: 0 },
        sort: { date: -1 }
      }
    );

    if (!trend) {
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
      data: trend,
    });
  } catch (error) {
    console.error('Error fetching latest trend:', error);

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
