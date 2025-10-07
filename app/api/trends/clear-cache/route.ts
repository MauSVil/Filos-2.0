import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/mongodb';

/**
 * DELETE /api/trends/clear-cache
 * Limpia el cache de tendencias para forzar regeneración
 */
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const trendsCollection = db.collection('trends');

    // Borrar todos los documentos de tendencias
    const result = await trendsCollection.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Cache limpiado: ${result.deletedCount} documentos eliminados`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing trends cache:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al limpiar el cache',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
