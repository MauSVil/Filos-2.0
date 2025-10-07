# Plan de Implementación: Integración con MercadoLibre

## 🎯 Objetivo
Integrar publicación automática de productos de Filos a MercadoLibre México, con sincronización bidireccional de inventario y órdenes.

---

## 📊 Funcionalidades Principales

### 1. **Publicación Automática**
- Crear publicaciones en MercadoLibre directamente desde Filos
- Mapeo automático de datos: producto Filos → listing MercadoLibre
- Predicción automática de categorías
- Carga de imágenes

### 2. **Sincronización de Inventario**
- Actualización bidireccional de stock
- Cuando se vende en ML → reduce inventario en Filos
- Cuando se vende en Filos → reduce inventario en ML
- Prevención de overselling

### 3. **Gestión de Órdenes**
- Importar órdenes de MercadoLibre a Filos
- Tracking unificado de ventas
- Notificaciones de nuevas ventas

### 4. **Dashboard de Control**
- Ver status de sincronización
- Conectar/desconectar cuenta de MercadoLibre
- Toggle para publicar/despublicar productos
- Analytics: ventas por canal

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│  Frontend: Dashboard de Marketplaces        │
│  /app/(private)/marketplaces                │
│  - Conexión de cuenta ML                    │
│  - Listado de productos sincronizados       │
│  - Analytics por canal                      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  API Routes: /api/marketplaces/mercadolibre │
│  - /auth/callback    (OAuth callback)       │
│  - /connect          (iniciar conexión)     │
│  - /listings         (CRUD listings)        │
│  - /sync             (forzar sync)          │
│  - /webhooks         (notificaciones ML)    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Services Layer                             │
│  - MercadoLibreAuthService                  │
│  - MercadoLibreListingService               │
│  - MercadoLibreSyncService                  │
│  - MercadoLibreWebhookService               │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  MongoDB Collections                        │
│  - marketplace_credentials                  │
│  - marketplace_listings                     │
│  - marketplace_orders                       │
└─────────────────────────────────────────────┘
```

---

## 📝 Plan de Implementación Detallado

### **Fase 1: Fundación y OAuth (Semana 1)**

#### Backend Structure
**Servicios a crear:**
```
services/marketplaces/mercadolibre/
├── MercadoLibreAuthService.ts       # OAuth 2.0 authentication
├── MercadoLibreListingService.ts    # CRUD de publicaciones
├── MercadoLibreSyncService.ts       # Sincronización de inventario
├── MercadoLibreWebhookService.ts    # Manejo de notificaciones
└── MercadoLibreApiClient.ts         # Cliente HTTP base
```

#### MongoDB Collection Schemas

##### 1. Collection: `marketplace_credentials`
```typescript
{
  _id: ObjectId,
  marketplace: 'mercadolibre',
  userId: ObjectId,                   // Usuario de Filos
  meliUserId: string,                 // ID de usuario en MercadoLibre
  accessToken: string,                // Encriptado
  refreshToken: string,               // Encriptado
  expiresAt: Date,                    // 6 horas desde creación
  siteId: 'MLM',                      // México
  nickname: string,                   // Nombre de cuenta ML
  email: string,
  active: boolean,
  connectedAt: Date,
  lastRefresh: Date,
  metadata: {
    points: number,
    reputation: string                // green, yellow, red
  }
}
```

##### 2. Collection: `marketplace_listings`
```typescript
{
  _id: ObjectId,
  productId: ObjectId,                // Referencia a producto Filos
  marketplace: 'mercadolibre',
  externalId: string,                 // ID en MercadoLibre (MLM123456789)
  sku: string,                        // uniqId del producto
  permalink: string,                  // URL pública de la publicación
  status: 'active' | 'paused' | 'closed' | 'error',
  categoryId: string,                 // MLA1430 (Ropa y Accesorios > Ropa > Suéteres)
  listingType: 'free' | 'gold_special' | 'gold_premium',
  price: number,
  availableQuantity: number,
  soldQuantity: number,
  createdAt: Date,
  lastSync: Date,
  syncErrors: [{
    date: Date,
    error: string,
    retryCount: number
  }],
  metadata: {
    title: string,
    pictures: string[],
    attributes: object,
    shippingMode: string,
    condition: 'new' | 'used'
  }
}
```

##### 3. Collection: `marketplace_orders`
```typescript
{
  _id: ObjectId,
  marketplace: 'mercadolibre',
  externalOrderId: string,            // Order ID en MercadoLibre
  internalOrderId: ObjectId | null,   // Referencia a orden en Filos (si existe)
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  items: [{
    productId: ObjectId,
    listingId: ObjectId,              // Referencia a marketplace_listings
    externalItemId: string,           // Item ID en ML
    title: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number
  }],
  buyer: {
    meliId: string,
    nickname: string,
    email: string,
    phone: string,
    firstName: string,
    lastName: string
  },
  shipping: {
    mode: string,                     // me2, me1, custom
    address: object,
    status: string,
    trackingNumber?: string
  },
  payment: {
    method: string,
    status: string,
    totalAmount: number,
    currency: 'MXN'
  },
  createdAt: Date,
  updatedAt: Date,
  importedAt: Date,
  processed: boolean                  // Si ya se procesó en Filos
}
```

#### API Routes

```
POST   /api/marketplaces/mercadolibre/connect        # Inicia OAuth flow
GET    /api/marketplaces/mercadolibre/auth/callback  # OAuth callback
POST   /api/marketplaces/mercadolibre/disconnect     # Desconectar cuenta
GET    /api/marketplaces/mercadolibre/status         # Estado de conexión

POST   /api/marketplaces/mercadolibre/listings       # Crear publicación
GET    /api/marketplaces/mercadolibre/listings       # Listar publicaciones
PUT    /api/marketplaces/mercadolibre/listings/:id   # Actualizar publicación
DELETE /api/marketplaces/mercadolibre/listings/:id   # Eliminar publicación

POST   /api/marketplaces/mercadolibre/sync           # Forzar sincronización
POST   /api/marketplaces/mercadolibre/webhooks       # Recibir notificaciones ML
```

---

### **Fase 2: Servicios Core (Semana 2)**

#### 1. MercadoLibreAuthService

```typescript
// services/marketplaces/mercadolibre/MercadoLibreAuthService.ts

export class MercadoLibreAuthService {
  private static readonly CLIENT_ID = process.env.MELI_CLIENT_ID;
  private static readonly CLIENT_SECRET = process.env.MELI_CLIENT_SECRET;
  private static readonly REDIRECT_URI = process.env.MELI_REDIRECT_URI;
  private static readonly AUTH_URL = 'https://auth.mercadolibre.com.mx/authorization';
  private static readonly TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';

  /**
   * Genera URL de autorización para OAuth
   */
  static getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID!,
      redirect_uri: this.REDIRECT_URI!,
      ...(state && { state })
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Intercambia código de autorización por access token
   */
  static async getAccessToken(code: string) {
    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        code,
        redirect_uri: this.REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,        // 21600 segundos (6 horas)
      userId: data.user_id,
      scope: data.scope
    };
  }

  /**
   * Refresca access token usando refresh token
   */
  static async refreshAccessToken(refreshToken: string) {
    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  /**
   * Obtiene información del usuario autenticado
   */
  static async getUserInfo(accessToken: string) {
    const response = await fetch('https://api.mercadolibre.com/users/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Guarda credenciales en MongoDB (con encriptación)
   */
  static async saveCredentials(data: any) {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expiresIn);

    // TODO: Encriptar tokens antes de guardar
    const credentials = {
      marketplace: 'mercadolibre',
      meliUserId: data.userId,
      accessToken: data.accessToken,      // Encriptar
      refreshToken: data.refreshToken,    // Encriptar
      expiresAt,
      siteId: 'MLM',
      active: true,
      connectedAt: new Date(),
      lastRefresh: new Date()
    };

    await collection.updateOne(
      { marketplace: 'mercadolibre', meliUserId: data.userId },
      { $set: credentials },
      { upsert: true }
    );

    return credentials;
  }

  /**
   * Obtiene credenciales válidas (refresca si es necesario)
   */
  static async getValidCredentials() {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    const creds = await collection.findOne({
      marketplace: 'mercadolibre',
      active: true
    });

    if (!creds) {
      throw new Error('No MercadoLibre credentials found');
    }

    // Si el token está por expirar (menos de 1 hora), refrescarlo
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    if (creds.expiresAt < oneHourFromNow) {
      const refreshed = await this.refreshAccessToken(creds.refreshToken);

      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshed.expiresIn);

      await collection.updateOne(
        { _id: creds._id },
        {
          $set: {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            expiresAt: newExpiresAt,
            lastRefresh: new Date()
          }
        }
      );

      return refreshed.accessToken;
    }

    return creds.accessToken;
  }
}
```

#### 2. MercadoLibreListingService

```typescript
// services/marketplaces/mercadolibre/MercadoLibreListingService.ts

import { ProductBaseType } from '@/types/v2/Product/Base.type';

export class MercadoLibreListingService {
  private static readonly API_BASE = 'https://api.mercadolibre.com';

  /**
   * Predice la categoría apropiada basado en el título
   */
  static async predictCategory(title: string): Promise<string> {
    const accessToken = await MercadoLibreAuthService.getValidCredentials();

    const response = await fetch(
      `${this.API_BASE}/sites/MLM/domain_discovery/search?q=${encodeURIComponent(title)}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to predict category');
    }

    const predictions = await response.json();

    if (!predictions || predictions.length === 0) {
      // Categoría por defecto: Ropa y Accesorios > Ropa > Suéteres
      return 'MLM1430';
    }

    return predictions[0].category_id;
  }

  /**
   * Mapea producto Filos a formato MercadoLibre
   */
  static async mapProductToListing(product: ProductBaseType) {
    const categoryId = await this.predictCategory(
      `${product.name} ${product.color} ${product.size}`
    );

    return {
      site_id: 'MLM',
      title: `${product.name} - ${product.color} - Talla ${product.size}`,
      category_id: categoryId,
      price: product.webPagePrice,
      currency_id: 'MXN',
      available_quantity: product.quantity,
      buying_mode: 'buy_it_now',
      listing_type_id: 'gold_special',   // Clásica (gratis) o gold_special
      condition: 'new',
      description: {
        plain_text: `${product.name}\nColor: ${product.color}\nTalla: ${product.size}`
      },
      pictures: [
        { source: product.image }         // ML descarga la imagen automáticamente
      ],
      attributes: [
        { id: 'COLOR', value_name: product.color },
        { id: 'SIZE', value_name: product.size },
        { id: 'BRAND', value_name: 'Filos' }
      ],
      shipping: {
        mode: 'me2',                      // Mercado Envíos
        free_shipping: false,
        local_pick_up: true
      }
    };
  }

  /**
   * Crea una publicación en MercadoLibre
   */
  static async createListing(product: ProductBaseType) {
    const accessToken = await MercadoLibreAuthService.getValidCredentials();
    const listingData = await this.mapProductToListing(product);

    const response = await fetch(`${this.API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create listing: ${JSON.stringify(error)}`);
    }

    const listing = await response.json();

    // Guardar en MongoDB
    await this.saveListing(product._id, listing);

    return {
      id: listing.id,
      permalink: listing.permalink,
      status: listing.status
    };
  }

  /**
   * Actualiza una publicación existente
   */
  static async updateListing(listingId: string, updates: any) {
    const accessToken = await MercadoLibreAuthService.getValidCredentials();

    const response = await fetch(`${this.API_BASE}/items/${listingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update listing: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Actualiza solo el stock
   */
  static async updateStock(listingId: string, quantity: number) {
    return await this.updateListing(listingId, {
      available_quantity: quantity
    });
  }

  /**
   * Actualiza solo el precio
   */
  static async updatePrice(listingId: string, price: number) {
    return await this.updateListing(listingId, {
      price
    });
  }

  /**
   * Pausa una publicación
   */
  static async pauseListing(listingId: string) {
    return await this.updateListing(listingId, {
      status: 'paused'
    });
  }

  /**
   * Reactiva una publicación
   */
  static async activateListing(listingId: string) {
    return await this.updateListing(listingId, {
      status: 'active'
    });
  }

  /**
   * Elimina una publicación (cierra permanentemente)
   */
  static async deleteListing(listingId: string) {
    return await this.updateListing(listingId, {
      status: 'closed'
    });
  }

  /**
   * Obtiene información de una publicación
   */
  static async getListing(listingId: string) {
    const accessToken = await MercadoLibreAuthService.getValidCredentials();

    const response = await fetch(`${this.API_BASE}/items/${listingId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to get listing: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Guarda listing en MongoDB
   */
  private static async saveListing(productId: string, listing: any) {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    const document = {
      productId: new ObjectId(productId),
      marketplace: 'mercadolibre',
      externalId: listing.id,
      sku: listing.seller_custom_field,
      permalink: listing.permalink,
      status: listing.status,
      categoryId: listing.category_id,
      listingType: listing.listing_type_id,
      price: listing.price,
      availableQuantity: listing.available_quantity,
      soldQuantity: listing.sold_quantity,
      createdAt: new Date(listing.date_created),
      lastSync: new Date(),
      syncErrors: [],
      metadata: {
        title: listing.title,
        pictures: listing.pictures?.map((p: any) => p.url) || [],
        attributes: listing.attributes,
        shippingMode: listing.shipping?.mode,
        condition: listing.condition
      }
    };

    await collection.updateOne(
      { externalId: listing.id },
      { $set: document },
      { upsert: true }
    );
  }
}
```

#### 3. MercadoLibreWebhookService

```typescript
// services/marketplaces/mercadolibre/MercadoLibreWebhookService.ts

export class MercadoLibreWebhookService {
  /**
   * Procesa notificación de MercadoLibre
   */
  static async processNotification(notification: any) {
    const { topic, resource } = notification;

    switch (topic) {
      case 'orders_v2':
        await this.handleOrderNotification(resource);
        break;

      case 'items':
        await this.handleItemNotification(resource);
        break;

      case 'questions':
        await this.handleQuestionNotification(resource);
        break;

      default:
        console.log(`Unhandled topic: ${topic}`);
    }
  }

  /**
   * Maneja notificación de orden
   */
  private static async handleOrderNotification(resourceUrl: string) {
    const orderId = resourceUrl.split('/').pop();
    const accessToken = await MercadoLibreAuthService.getValidCredentials();

    // Obtener detalles de la orden
    const response = await fetch(resourceUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const order = await response.json();

    // Guardar orden en MongoDB
    await this.saveOrder(order);

    // Actualizar inventario en Filos
    await this.updateInventoryFromOrder(order);
  }

  /**
   * Guarda orden en MongoDB
   */
  private static async saveOrder(order: any) {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_orders');

    const document = {
      marketplace: 'mercadolibre',
      externalOrderId: order.id.toString(),
      status: order.status,
      items: order.order_items.map((item: any) => ({
        externalItemId: item.item.id,
        title: item.item.title,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.full_unit_price * item.quantity
      })),
      buyer: {
        meliId: order.buyer.id.toString(),
        nickname: order.buyer.nickname,
        email: order.buyer.email,
        phone: order.buyer.phone?.area_code + order.buyer.phone?.number,
        firstName: order.buyer.first_name,
        lastName: order.buyer.last_name
      },
      shipping: order.shipping,
      payment: {
        method: order.payments?.[0]?.payment_method_id,
        status: order.payments?.[0]?.status,
        totalAmount: order.total_amount,
        currency: order.currency_id
      },
      createdAt: new Date(order.date_created),
      updatedAt: new Date(),
      importedAt: new Date(),
      processed: false
    };

    await collection.updateOne(
      { externalOrderId: order.id.toString() },
      { $set: document },
      { upsert: true }
    );
  }

  /**
   * Actualiza inventario cuando se vende en ML
   */
  private static async updateInventoryFromOrder(order: any) {
    const client = await clientPromise;
    const db = client.db('test');
    const productsCollection = db.collection('products');
    const listingsCollection = db.collection('marketplace_listings');

    for (const item of order.order_items) {
      // Buscar listing en nuestra DB
      const listing = await listingsCollection.findOne({
        externalId: item.item.id
      });

      if (!listing) {
        console.warn(`Listing not found: ${item.item.id}`);
        continue;
      }

      // Reducir stock en Filos
      await productsCollection.updateOne(
        { _id: listing.productId },
        { $inc: { quantity: -item.quantity } }
      );

      console.log(`Reduced stock for product ${listing.productId} by ${item.quantity}`);
    }
  }

  /**
   * Maneja notificación de item (cambios en publicación)
   */
  private static async handleItemNotification(resourceUrl: string) {
    // Sincronizar cambios de la publicación
    const itemId = resourceUrl.split('/').pop();
    const listing = await MercadoLibreListingService.getListing(itemId!);

    // Actualizar en MongoDB
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_listings');

    await collection.updateOne(
      { externalId: itemId },
      {
        $set: {
          status: listing.status,
          price: listing.price,
          availableQuantity: listing.available_quantity,
          soldQuantity: listing.sold_quantity,
          lastSync: new Date()
        }
      }
    );
  }

  /**
   * Maneja notificación de pregunta
   */
  private static async handleQuestionNotification(resourceUrl: string) {
    // TODO: Implementar manejo de preguntas
    console.log('Question notification received:', resourceUrl);
  }
}
```

---

### **Fase 3: API Routes (Semana 2)**

#### API Routes Implementation

```typescript
// app/api/marketplaces/mercadolibre/connect/route.ts
export async function GET() {
  const authUrl = MercadoLibreAuthService.getAuthorizationUrl();
  return NextResponse.redirect(authUrl);
}

// app/api/marketplaces/mercadolibre/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Intercambiar code por tokens
    const tokens = await MercadoLibreAuthService.getAccessToken(code);

    // Obtener info del usuario
    const userInfo = await MercadoLibreAuthService.getUserInfo(tokens.accessToken);

    // Guardar credenciales
    await MercadoLibreAuthService.saveCredentials({
      ...tokens,
      userId: userInfo.id,
      nickname: userInfo.nickname,
      email: userInfo.email
    });

    // Redirigir a dashboard
    return NextResponse.redirect('/marketplaces?connected=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/marketplaces?error=auth_failed');
  }
}

// app/api/marketplaces/mercadolibre/listings/route.ts
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    // Obtener producto
    const client = await clientPromise;
    const db = client.db('test');
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Crear listing
    const listing = await MercadoLibreListingService.createListing(product);

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

// app/api/marketplaces/mercadolibre/webhooks/route.ts
export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();

    await MercadoLibreWebhookService.processNotification(notification);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

### **Fase 4: Frontend Dashboard (Semana 3)**

#### Estructura de Componentes

```
app/(private)/marketplaces/
├── page.tsx
├── _components/
│   ├── ConnectionCard.tsx          # Estado de conexión ML
│   ├── ListingsTable.tsx           # Tabla de publicaciones
│   ├── PublishModal.tsx            # Modal para publicar producto
│   ├── SyncStatusBadge.tsx         # Badge de status
│   └── AnalyticsChart.tsx          # Gráfico de ventas por canal
└── _modules/
    └── useMarketplacesModule.ts    # Lógica del módulo
```

#### UI Principal

```tsx
// app/(private)/marketplaces/_components/ConnectionCard.tsx

export const ConnectionCard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    // Verificar estado de conexión
    fetch('/api/marketplaces/mercadolibre/status')
      .then(res => res.json())
      .then(data => {
        setIsConnected(data.connected);
        setAccountInfo(data.account);
      });
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/marketplaces/mercadolibre/connect';
  };

  const handleDisconnect = async () => {
    await fetch('/api/marketplaces/mercadolibre/disconnect', { method: 'POST' });
    setIsConnected(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/mercadolibre-logo.svg" className="h-6" />
          MercadoLibre México
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="success">Conectado</Badge>
              <span className="text-sm text-muted-foreground">
                @{accountInfo?.nickname}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
                <p className="text-2xl font-bold">{accountInfo?.listings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas (mes)</p>
                <p className="text-2xl font-bold">{accountInfo?.sales || 0}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Desconectar
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={accountInfo?.permalink} target="_blank">
                  Ver en MercadoLibre
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Conecta tu cuenta de MercadoLibre para publicar productos automáticamente
            </p>
            <Button onClick={handleConnect}>
              Conectar cuenta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

```tsx
// app/(private)/marketplaces/_components/ListingsTable.tsx

export const ListingsTable = () => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      const res = await fetch('/api/marketplaces/mercadolibre/listings');
      return res.json();
    }
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicaciones en MercadoLibre</CardTitle>
        <CardDescription>
          Gestiona tus productos publicados en MercadoLibre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Vendidos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map((listing: any) => (
              <TableRow key={listing._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img src={listing.metadata.pictures[0]} className="h-10 w-10 rounded" />
                    <div>
                      <p className="font-medium">{listing.metadata.title}</p>
                      <a
                        href={listing.permalink}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Ver en ML
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <SyncStatusBadge status={listing.status} />
                </TableCell>
                <TableCell>${listing.price}</TableCell>
                <TableCell>{listing.availableQuantity}</TableCell>
                <TableCell>{listing.soldQuantity}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Pausar</DropdownMenuItem>
                      <DropdownMenuItem>Sincronizar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
```

---

### **Fase 5: Sincronización Automática (Semana 3)**

#### Cron Job para Sync

```typescript
// app/api/cron/sync-marketplaces/route.ts

import schedule from 'node-schedule';

export async function GET() {
  // Sync cada 5 minutos
  schedule.scheduleJob('*/5 * * * *', async () => {
    await syncAllListings();
  });

  return NextResponse.json({ message: 'Cron job started' });
}

async function syncAllListings() {
  const client = await clientPromise;
  const db = client.db('test');
  const listingsCollection = db.collection('marketplace_listings');
  const productsCollection = db.collection('products');

  const listings = await listingsCollection.find({
    marketplace: 'mercadolibre',
    status: 'active'
  }).toArray();

  for (const listing of listings) {
    try {
      // Obtener producto actual en Filos
      const product = await productsCollection.findOne({ _id: listing.productId });

      if (!product) continue;

      // Obtener estado actual en ML
      const mlListing = await MercadoLibreListingService.getListing(listing.externalId);

      // Sincronizar stock si hay diferencia
      if (product.quantity !== mlListing.available_quantity) {
        await MercadoLibreListingService.updateStock(
          listing.externalId,
          product.quantity
        );

        console.log(`Synced stock for ${listing.externalId}: ${product.quantity}`);
      }

      // Sincronizar precio si hay diferencia
      if (product.webPagePrice !== mlListing.price) {
        await MercadoLibreListingService.updatePrice(
          listing.externalId,
          product.webPagePrice
        );

        console.log(`Synced price for ${listing.externalId}: ${product.webPagePrice}`);
      }

      // Actualizar última sincronización
      await listingsCollection.updateOne(
        { _id: listing._id },
        { $set: { lastSync: new Date() } }
      );

    } catch (error) {
      console.error(`Error syncing listing ${listing.externalId}:`, error);

      // Registrar error
      await listingsCollection.updateOne(
        { _id: listing._id },
        {
          $push: {
            syncErrors: {
              date: new Date(),
              error: error.message,
              retryCount: 1
            }
          }
        }
      );
    }
  }
}
```

---

## 🔐 Variables de Entorno

```env
# MercadoLibre API
MELI_CLIENT_ID=your_client_id
MELI_CLIENT_SECRET=your_client_secret
MELI_REDIRECT_URI=https://yourapp.com/api/marketplaces/mercadolibre/auth/callback

# Webhook URL (para configurar en MercadoLibre)
MELI_WEBHOOK_URL=https://yourapp.com/api/marketplaces/mercadolibre/webhooks
```

---

## 🎯 Configuración en MercadoLibre

### 1. Crear Aplicación
1. Ir a https://developers.mercadolibre.com.mx/
2. Crear nueva aplicación
3. Obtener `Client ID` y `Client Secret`
4. Configurar `Redirect URI`

### 2. Configurar Webhooks
1. En la configuración de la app, ir a "Notificaciones"
2. Agregar URL de webhook: `https://yourapp.com/api/marketplaces/mercadolibre/webhooks`
3. Suscribirse a topics:
   - `orders_v2` (órdenes)
   - `items` (cambios en publicaciones)
   - `questions` (preguntas)

---

## 📋 Checklist de Implementación

### Semana 1: Fundación
- [ ] Crear estructura de servicios
- [ ] Implementar `MercadoLibreAuthService`
- [ ] OAuth flow completo (connect → callback)
- [ ] Token management (storage + refresh)
- [ ] Crear MongoDB collections
- [ ] Testing de autenticación

### Semana 2: Core Services
- [ ] Implementar `MercadoLibreListingService`
- [ ] Category predictor
- [ ] Crear publicaciones (POST /items)
- [ ] Actualizar publicaciones (PUT /items)
- [ ] Implementar `MercadoLibreWebhookService`
- [ ] Manejo de notificaciones de órdenes
- [ ] API routes básicas
- [ ] Testing de CRUD listings

### Semana 3: Frontend + Sync
- [ ] Dashboard de marketplaces
- [ ] ConnectionCard component
- [ ] ListingsTable component
- [ ] PublishModal component
- [ ] Implementar sincronización automática (cron)
- [ ] Sync bidireccional de inventario
- [ ] Error handling y retry logic
- [ ] Testing end-to-end

---

## 💰 Costos

| Concepto | Costo |
|----------|-------|
| API de MercadoLibre | Gratis |
| Comisión por venta | 11-16% |
| Publicación gratuita | $0 |
| Publicación clásica | $65 MXN |
| Publicación premium | $299 MXN |
| **Desarrollo** | **~120 horas** |

---

## 🎯 Métricas de Éxito

- **Sync Success Rate**: >95%
- **Sync Latency**: <5 minutos
- **Order Import Time**: <2 minutos
- **Inventory Accuracy**: 99.9%
- **Time Saved**: 5-10 horas/semana

---

## 🚀 Futuras Mejoras

1. **Bulk Publishing**: Publicar múltiples productos a la vez
2. **Analytics Dashboard**: Ventas por canal, ROI, productos top
3. **Auto-Repricing**: Ajustar precios basado en competencia
4. **Template System**: Plantillas para descripciones
5. **Multi-variant Listings**: Agrupar color/size en una sola publicación
6. **Questions Auto-responder**: Bot para responder preguntas frecuentes
7. **Promotions Sync**: Sincronizar descuentos entre Filos y ML

---

**Última actualización:** 2025-10-07
**Versión:** 1.0
**Estado:** Planeación completa
