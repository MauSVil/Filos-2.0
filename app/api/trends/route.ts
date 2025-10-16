import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/mongodb';

/**
 * GET /api/trends
 * Obtiene lista de todos los análisis de tendencias disponibles
 *
 * Query params:
 *  - limit: número de registros a obtener (default: todos)
 *  - sort: 'asc' | 'desc' (default: 'desc' - más recientes primero)
 *
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       date: "2025-10-16",
 *       timestamp: "2025-10-16T02:23:14.756Z",
 *       category: "suéteres",
 *       imageStats: {
 *         totalTermsSearched: 15,
 *         totalImagesFound: 75,
 *         termsWithImages: 15,
 *         termsWithoutImages: 0
 *       }
 *     }
 *   ],
 *   count: 1
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const sort = searchParams.get('sort') === 'asc' ? 1 : -1;

    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('trends_results');

    // Obtener lista de análisis (solo metadatos, sin los datos completos)
    let query = collection
      .find(
        {},
        {
          projection: {
            _id: 1,
            date: 1,
            timestamp: 1,
            category: 1,
            imageStats: 1,
            'metadata.generatedAt': 1
          }
        }
      )
      .sort({ date: sort });

    if (limit) {
      query = query.limit(limit);
    }

    const trends = await query.toArray();

    // Convertir _id a string para cada documento
    const trendsWithStringId = trends.map(trend => ({
      ...trend,
      _id: trend._id.toString()
    }));

    return NextResponse.json({
      success: true,
      data: trendsWithStringId,
      count: trendsWithStringId.length,
    });
  } catch (error) {
    console.error('Error fetching trends list:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener lista de tendencias',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
