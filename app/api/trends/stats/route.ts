import { NextResponse } from 'next/server';
import clientPromise from '@/mongodb';

/**
 * GET /api/trends/stats
 * Obtiene estadísticas generales de todos los análisis de tendencias
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     totalAnalyses: 1,
 *     firstAnalysis: "2025-10-16",
 *     latestAnalysis: "2025-10-16",
 *     totalImages: 75,
 *     totalTerms: 15,
 *     averageImagesPerAnalysis: 75
 *   }
 * }
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('trends_results');

    // Contar total de documentos
    const totalAnalyses = await collection.countDocuments();

    if (totalAnalyses === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalAnalyses: 0,
          firstAnalysis: null,
          latestAnalysis: null,
          totalImages: 0,
          totalTerms: 0,
          averageImagesPerAnalysis: 0
        }
      });
    }

    // Obtener primer y último análisis
    const [firstDoc, lastDoc] = await Promise.all([
      collection.findOne({}, { projection: { date: 1 }, sort: { date: 1 } }),
      collection.findOne({}, { projection: { date: 1 }, sort: { date: -1 } })
    ]);

    // Agregación para obtener totales
    const aggregation = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: '$imageStats.totalImagesFound' },
          totalTerms: { $sum: '$imageStats.totalTermsSearched' },
          avgImages: { $avg: '$imageStats.totalImagesFound' }
        }
      }
    ]).toArray();

    const stats = aggregation[0] || {
      totalImages: 0,
      totalTerms: 0,
      avgImages: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        totalAnalyses,
        firstAnalysis: firstDoc?.date || null,
        latestAnalysis: lastDoc?.date || null,
        totalImages: stats.totalImages,
        totalTerms: stats.totalTerms,
        averageImagesPerAnalysis: Math.round(stats.avgImages)
      }
    });
  } catch (error) {
    console.error('Error fetching trends stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener estadísticas de tendencias',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
