import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/mongodb';
import { SerperImageService } from '@/services/trends/SerperImageService';

/**
 * GET /api/trends/images?keyword=sueter+oversize&count=9
 * Obtiene imágenes de tendencias para un keyword específico
 * Usa cache de 7 días para evitar requests innecesarios
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const count = parseInt(searchParams.get('count') || '9');

    if (!keyword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Keyword es requerido',
            devMessage: 'Missing required parameter: keyword',
          },
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('test');
    const imagesCollection = db.collection('trend_images');

    // Buscar en cache
    const cached = await imagesCollection.findOne({
      keyword,
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.images,
        cached: true,
        fetchedAt: cached.fetchedAt,
      });
    }

    // Si no hay cache, buscar en Serper API
    const images = await SerperImageService.searchImages(keyword, count);

    // Guardar en cache (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await imagesCollection.updateOne(
      { keyword },
      {
        $set: {
          keyword,
          images,
          fetchedAt: new Date(),
          expiresAt,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: images,
      cached: false,
      fetchedAt: new Date(),
    });
  } catch (error) {
    console.error('Error fetching trend images:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener imágenes de tendencias',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
