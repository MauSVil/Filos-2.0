import { NextRequest, NextResponse } from 'next/server';
import { MercadoLibreListingService } from '@/services/marketplaces/mercadolibre/MercadoLibreListingService';
import clientPromise from '@/mongodb';
import { ObjectId } from 'mongodb';

/**
 * POST /api/marketplaces/mercadolibre/listings
 * Crea una nueva publicación en MercadoLibre
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, listingData } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Product ID es requerido',
            devMessage: 'Missing required parameter: productId',
          },
        },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const client = await clientPromise;
    const db = client.db('test');
    const productsCollection = db.collection('products');

    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Producto no encontrado',
            devMessage: `Product with ID ${productId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Verificar si ya está publicado
    const isListed = await MercadoLibreListingService.isProductListed(productId);

    if (isListed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Este producto ya está publicado en MercadoLibre',
            devMessage: 'Product already has an active listing',
          },
        },
        { status: 409 }
      );
    }

    // Crear listing en MercadoLibre con datos personalizados
    const result = await MercadoLibreListingService.createListing(product as any, listingData);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Producto publicado exitosamente en MercadoLibre',
    });
  } catch (error) {
    console.error('Error creating listing:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al publicar producto en MercadoLibre',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplaces/mercadolibre/listings?productId=xxx
 * Obtiene las publicaciones de un producto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Product ID es requerido',
            devMessage: 'Missing required parameter: productId',
          },
        },
        { status: 400 }
      );
    }

    const listings = await MercadoLibreListingService.getListingsByProduct(productId);

    return NextResponse.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener publicaciones',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
