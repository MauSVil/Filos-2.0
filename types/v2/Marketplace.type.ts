import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Schema para credenciales de marketplace
 * Collection: marketplace_credentials
 */
export const MarketplaceCredentials = z.object({
  _id: z.instanceof(ObjectId).optional(),
  marketplace: z.enum(['mercadolibre', 'amazon']),
  meliUserId: z.string().optional(), // Para MercadoLibre
  sellerId: z.string().optional(), // Para Amazon
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.date(),
  siteId: z.string(), // MLM, MLA, etc.
  nickname: z.string().optional(),
  email: z.string().email().optional(),
  active: z.boolean(),
  connectedAt: z.date(),
  lastRefresh: z.date(),
  disconnectedAt: z.date().optional(),
  metadata: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      countryId: z.string().optional(),
      points: z.number().optional(),
      reputation: z.string().optional(),
    })
    .optional(),
});

export type MarketplaceCredentialsType = z.infer<typeof MarketplaceCredentials>;

/**
 * Schema para listados de productos en marketplaces
 * Collection: marketplace_listings
 */
export const MarketplaceListing = z.object({
  _id: z.instanceof(ObjectId).optional(),
  productId: z.instanceof(ObjectId),
  marketplace: z.enum(['mercadolibre', 'amazon']),
  externalId: z.string(), // ID en el marketplace
  sku: z.string(),
  permalink: z.string().url(),
  status: z.enum(['active', 'paused', 'closed', 'error']),
  categoryId: z.string(),
  listingType: z.string().optional(), // gold_special, free, etc
  price: z.number(),
  availableQuantity: z.number(),
  soldQuantity: z.number().default(0),
  createdAt: z.date(),
  lastSync: z.date(),
  syncErrors: z
    .array(
      z.object({
        date: z.date(),
        error: z.string(),
        retryCount: z.number(),
      })
    )
    .default([]),
  metadata: z
    .object({
      title: z.string(),
      pictures: z.array(z.string().url()),
      attributes: z.record(z.any()).optional(),
      shippingMode: z.string().optional(),
      condition: z.enum(['new', 'used']),
      description: z.string().optional(),
    })
    .optional(),
});

export type MarketplaceListingType = z.infer<typeof MarketplaceListing>;

/**
 * Schema para órdenes de marketplaces
 * Collection: marketplace_orders
 */
export const MarketplaceOrder = z.object({
  _id: z.instanceof(ObjectId).optional(),
  marketplace: z.enum(['mercadolibre', 'amazon']),
  externalOrderId: z.string(),
  internalOrderId: z.instanceof(ObjectId).optional().nullable(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  items: z.array(
    z.object({
      productId: z.instanceof(ObjectId).optional(),
      listingId: z.instanceof(ObjectId).optional(),
      externalItemId: z.string(),
      title: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
  buyer: z.object({
    meliId: z.string().optional(),
    nickname: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
  shipping: z
    .object({
      mode: z.string().optional(),
      address: z.record(z.any()).optional(),
      status: z.string().optional(),
      trackingNumber: z.string().optional(),
    })
    .optional(),
  payment: z
    .object({
      method: z.string().optional(),
      status: z.string().optional(),
      totalAmount: z.number(),
      currency: z.string().default('MXN'),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  importedAt: z.date(),
  processed: z.boolean().default(false),
});

export type MarketplaceOrderType = z.infer<typeof MarketplaceOrder>;

/**
 * Input para crear un listing
 */
export const CreateListingInput = z.object({
  productId: z.string(),
  marketplace: z.enum(['mercadolibre', 'amazon']),
  listingType: z.string().optional(),
  customPrice: z.number().optional(),
});

export type CreateListingInputType = z.infer<typeof CreateListingInput>;

/**
 * Input para actualizar un listing
 */
export const UpdateListingInput = z.object({
  price: z.number().optional(),
  availableQuantity: z.number().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});

export type UpdateListingInputType = z.infer<typeof UpdateListingInput>;
