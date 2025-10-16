import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/mongodb';

/**
 * GET /api/trends/[id]
 * Obtiene un análisis de tendencias específico por ID
 *
 * Params:
 *  - id: MongoDB ObjectId del análisis
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     _id: "507f1f77bcf86cd799439011",
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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar que sea un ObjectId válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'ID inválido',
            devMessage: 'Invalid MongoDB ObjectId format',
          },
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('trends_results');

    // Buscar análisis por _id
    const trend = await collection.findOne({
      _id: new ObjectId(id)
    });

    if (!trend) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `No se encontró análisis con ID ${id}`,
            devMessage: `No trend found for ID: ${id}`,
          },
        },
        { status: 404 }
      );
    }

    // Convertir _id a string para el response
    const trendWithStringId = {
      ...trend,
      _id: trend._id.toString()
    };

    return NextResponse.json({
      success: true,
      data: trendWithStringId,
    });
  } catch (error) {
    console.error('Error fetching trend by ID:', error);

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
