import { MercadoLibreAuthService } from './MercadoLibreAuthService';
import { ProductBaseType } from '@/types/v2/Product/Base.type';
import clientPromise from '@/mongodb';
import { ObjectId } from 'mongodb';

interface MercadoLibreItem {
  id: string;
  title: string;
  category_id: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  buying_mode: string;
  listing_type_id: string;
  condition: string;
  description?: {
    plain_text: string;
  };
  pictures: Array<{
    source?: string;
    url?: string;
  }>;
  attributes: Array<{
    id: string;
    value_name: string;
  }>;
  shipping: {
    mode: string;
    free_shipping: boolean;
    local_pick_up?: boolean;
  };
  permalink: string;
  status: string;
  date_created: string;
  sold_quantity: number;
  seller_custom_field?: string;
}

export class MercadoLibreListingService {
  private static readonly API_BASE = 'https://api.mercadolibre.com';

  /**
   * Predice la categoría apropiada basado en el título
   */
  static async predictCategory(title: string): Promise<string> {
    try {
      const accessToken = await MercadoLibreAuthService.getValidCredentials();

      const response = await fetch(
        `${this.API_BASE}/sites/MLM/domain_discovery/search?q=${encodeURIComponent(title)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        console.warn('Category prediction failed, using default');
        return 'MLM112197'; // Categoría por defecto: Chamarras (ropa mujer)
      }

      const predictions = await response.json();

      if (!predictions || predictions.length === 0) {
        console.warn('No predictions found, using generic category');
        return 'MLM112197'; // Categoría por defecto: Chamarras
      }

      const categoryId = predictions[0].category_id;
      console.log(`✅ Category predicted: ${categoryId} - ${predictions[0].category_name}`);

      // Verificar que sea una categoría leaf (hoja)
      const catResponse = await fetch(`${this.API_BASE}/categories/${categoryId}`);
      const categoryInfo = await catResponse.json();

      if (categoryInfo.children_categories && categoryInfo.children_categories.length > 0) {
        console.warn(`Category ${categoryId} is not a leaf, using generic category`);
        return 'MLM112197'; // Categoría por defecto: Chamarras
      }

      return categoryId;
    } catch (error) {
      console.error('Error predicting category:', error);
      return 'MLM112197'; // Categoría por defecto: Chamarras
    }
  }

  /**
   * Mapea producto Filos a formato MercadoLibre
   */
  static async mapProductToListing(product: ProductBaseType, customData?: any) {
    const title = customData?.title || `${product.name} - ${product.color} - Talla ${product.size}`;
    const categoryId = await this.predictCategory(title);

    return {
      title: title.substring(0, 60), // ML tiene límite de 60 caracteres
      category_id: categoryId,
      price: customData?.price || product.webPagePrice,
      currency_id: 'MXN',
      available_quantity: customData?.quantity ?? product.quantity,
      buying_mode: 'buy_it_now',
      listing_type_id: customData?.listingType || 'gold_special', // Publicación clásica
      condition: customData?.condition || 'new' as const,
      description: {
        plain_text: customData?.description || `${product.name}\nColor: ${product.color}\nTalla: ${product.size}\n\nProducto de calidad premium.`,
      },
      pictures: product.minioImage ? [
        { source: product.minioImage }, // ML descarga la imagen automáticamente
      ] : [],
      attributes: [
        { id: 'BRAND', value_name: customData?.brand || 'Filos' },
        { id: 'MODEL', value_name: product.name },
        { id: 'GENDER', value_name: 'Mujer' },
        { id: 'COLOR', value_name: product.color },
        { id: 'SIZE', value_name: product.size || 'Único' },
        ...(customData?.material ? [{ id: 'MATERIAL', value_name: customData.material }] : []),
        ...(customData?.style ? [{ id: 'STYLE', value_name: customData.style }] : []),
        ...(customData?.sleeveLength ? [{ id: 'SLEEVE_LENGTH', value_name: customData.sleeveLength }] : []),
        ...(customData?.season ? [{ id: 'SEASON', value_name: customData.season }] : []),
      ],
      shipping: {
        mode: 'me2', // Mercado Envíos
        free_shipping: customData?.freeShipping ?? false,
        local_pick_up: customData?.localPickup ?? true,
      },
      seller_custom_field: product.uniqId, // Para tracking
    };
  }

  /**
   * Crea una publicación en MercadoLibre
   */
  static async createListing(product: ProductBaseType, customData?: any) {
    try {
      const accessToken = await MercadoLibreAuthService.getValidCredentials();
      const listingData = await this.mapProductToListing(product, customData);

      console.log('📤 Sending listing data:', JSON.stringify(listingData, null, 2));

      const response = await fetch(`${this.API_BASE}/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ MercadoLibre API Error:', JSON.stringify(error, null, 2));
        throw new Error(
          `Failed to create listing: ${error.message || JSON.stringify(error)}`
        );
      }

      const listing: MercadoLibreItem = await response.json();

      // Guardar en MongoDB
      await this.saveListing(product._id, listing);

      return {
        success: true,
        listingId: listing.id,
        permalink: listing.permalink,
        status: listing.status,
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Actualiza una publicación existente
   */
  static async updateListing(listingId: string, updates: Partial<MercadoLibreItem>) {
    try {
      const accessToken = await MercadoLibreAuthService.getValidCredentials();

      const response = await fetch(`${this.API_BASE}/items/${listingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update listing: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  /**
   * Actualiza solo el stock
   */
  static async updateStock(listingId: string, quantity: number) {
    return await this.updateListing(listingId, {
      available_quantity: quantity,
    } as any);
  }

  /**
   * Actualiza solo el precio
   */
  static async updatePrice(listingId: string, price: number) {
    return await this.updateListing(listingId, {
      price,
    } as any);
  }

  /**
   * Pausa una publicación
   */
  static async pauseListing(listingId: string) {
    return await this.updateListing(listingId, {
      status: 'paused',
    } as any);
  }

  /**
   * Reactiva una publicación
   */
  static async activateListing(listingId: string) {
    return await this.updateListing(listingId, {
      status: 'active',
    } as any);
  }

  /**
   * Elimina una publicación (cierra permanentemente)
   */
  static async deleteListing(listingId: string) {
    return await this.updateListing(listingId, {
      status: 'closed',
    } as any);
  }

  /**
   * Obtiene información de una publicación
   */
  static async getListing(listingId: string) {
    try {
      const accessToken = await MercadoLibreAuthService.getValidCredentials();

      const response = await fetch(`${this.API_BASE}/items/${listingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to get listing: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las publicaciones del vendedor desde MercadoLibre
   */
  static async getAllListingsFromML() {
    try {
      const accessToken = await MercadoLibreAuthService.getValidCredentials();
      const accountInfo = await MercadoLibreAuthService.getConnectedAccount();

      if (!accountInfo) {
        throw new Error('No connected account found');
      }

      // Obtener publicaciones del vendedor
      const response = await fetch(
        `${this.API_BASE}/users/${accountInfo.meliUserId}/items/search?status=active,paused,closed&limit=50`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch listings from MercadoLibre');
      }

      const data = await response.json();
      const itemIds = data.results || [];

      // Obtener detalles de cada publicación
      const listings = await Promise.all(
        itemIds.map(async (itemId: string) => {
          try {
            return await this.getListing(itemId);
          } catch (error) {
            console.error(`Failed to fetch listing ${itemId}:`, error);
            return null;
          }
        })
      );

      return listings.filter((l) => l !== null);
    } catch (error) {
      console.error('Error fetching all listings from ML:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las publicaciones de un producto
   */
  static async getListingsByProduct(productId: string) {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    return await collection
      .find({
        productId: new ObjectId(productId),
        marketplace: 'mercadolibre',
      })
      .toArray();
  }

  /**
   * Verifica si un producto ya está publicado
   */
  static async isProductListed(productId: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    const listing = await collection.findOne({
      productId: new ObjectId(productId),
      marketplace: 'mercadolibre',
      status: { $in: ['active', 'paused'] },
    });

    return !!listing;
  }

  /**
   * Sincroniza el status de una publicación desde MercadoLibre
   */
  static async syncListingStatus(listingId: string) {
    try {
      const client = await clientPromise;
      const db = client.db('test');
      const collection = db.collection('marketplace_listings');

      // Obtener info actual de ML
      const mlListing = await this.getListing(listingId);

      // Actualizar en DB
      await collection.updateOne(
        { externalId: listingId },
        {
          $set: {
            status: mlListing.status,
            price: mlListing.price,
            availableQuantity: mlListing.available_quantity,
            soldQuantity: mlListing.sold_quantity || 0,
            lastSync: new Date(),
            'metadata.pictures': mlListing.pictures?.map((p: any) => p.url || p.source) || [],
          },
        }
      );

      return mlListing;
    } catch (error) {
      console.error('Error syncing listing status:', error);
      throw error;
    }
  }

  /**
   * Guarda listing en MongoDB
   */
  private static async saveListing(productId: string, listing: MercadoLibreItem) {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    const document = {
      productId: new ObjectId(productId),
      marketplace: 'mercadolibre',
      externalId: listing.id,
      sku: listing.seller_custom_field || '',
      permalink: listing.permalink,
      status: listing.status,
      categoryId: listing.category_id,
      listingType: listing.listing_type_id,
      price: listing.price,
      availableQuantity: listing.available_quantity,
      soldQuantity: listing.sold_quantity || 0,
      createdAt: new Date(listing.date_created),
      lastSync: new Date(),
      syncErrors: [],
      metadata: {
        title: listing.title,
        pictures: listing.pictures?.map((p) => p.url || p.source) || [],
        attributes: listing.attributes,
        shippingMode: listing.shipping?.mode,
        condition: listing.condition,
      },
    };

    await collection.updateOne(
      { externalId: listing.id },
      { $set: document },
      { upsert: true }
    );

    return document;
  }
}
