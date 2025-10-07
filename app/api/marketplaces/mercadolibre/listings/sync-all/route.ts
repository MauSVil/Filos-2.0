import { NextResponse } from 'next/server';
import { MercadoLibreListingService } from '@/services/marketplaces/mercadolibre/MercadoLibreListingService';
import clientPromise from '@/mongodb';
import { ObjectId } from 'mongodb';

/**
 * POST /api/marketplaces/mercadolibre/listings/sync-all
 * Sincroniza todas las publicaciones desde MercadoLibre a la base de datos local
 */
export async function POST() {
  try {
    console.log('🔄 Starting full sync from MercadoLibre...');

    // Obtener todas las publicaciones desde MercadoLibre
    const mlListings = await MercadoLibreListingService.getAllListingsFromML();
    console.log(`📥 Found ${mlListings.length} listings in MercadoLibre`);

    const client = await clientPromise;
    const db = client.db('test');
    const listingsCollection = db.collection('marketplace_listings');
    const productsCollection = db.collection('products');

    let synced = 0;
    let notFound = 0;

    // Sincronizar cada publicación
    for (const mlListing of mlListings) {
      try {
        // Buscar el producto por SKU (seller_custom_field)
        const sku = mlListing.seller_custom_field;
        const product = await productsCollection.findOne({ uniqId: sku });

        if (!product) {
          console.warn(`⚠️ Product not found for SKU: ${sku}`);
          notFound++;
          continue;
        }

        // Guardar o actualizar en la base de datos
        const document = {
          productId: new ObjectId(product._id),
          marketplace: 'mercadolibre',
          externalId: mlListing.id,
          sku: sku || '',
          permalink: mlListing.permalink,
          status: mlListing.status,
          categoryId: mlListing.category_id,
          listingType: mlListing.listing_type_id,
          price: mlListing.price,
          availableQuantity: mlListing.available_quantity,
          soldQuantity: mlListing.sold_quantity || 0,
          createdAt: new Date(mlListing.date_created),
          lastSync: new Date(),
          syncErrors: [],
          metadata: {
            title: mlListing.title,
            pictures: mlListing.pictures?.map((p: any) => p.url || p.secure_url) || [],
            attributes: mlListing.attributes,
            shippingMode: mlListing.shipping?.mode,
            condition: mlListing.condition,
          },
        };

        await listingsCollection.updateOne(
          { externalId: mlListing.id },
          { $set: document },
          { upsert: true }
        );

        synced++;
        console.log(`✅ Synced: ${mlListing.title}`);
      } catch (error) {
        console.error(`❌ Error syncing listing ${mlListing.id}:`, error);
      }
    }

    console.log(`✨ Sync complete: ${synced} synced, ${notFound} not found`);

    return NextResponse.json({
      success: true,
      data: {
        totalFromML: mlListings.length,
        synced,
        notFound,
      },
      message: `Sincronizadas ${synced} publicaciones`,
    });
  } catch (error) {
    console.error('Error syncing all listings:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al sincronizar publicaciones',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
