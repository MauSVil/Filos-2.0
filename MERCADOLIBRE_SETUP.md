# Setup de MercadoLibre - Fase 1 Completada ✅

## 🎉 ¿Qué se ha implementado?

### ✅ Estructura de Servicios
- `services/marketplaces/mercadolibre/MercadoLibreAuthService.ts`
- Servicio completo de autenticación OAuth 2.0

### ✅ MongoDB Schemas
- `types/v2/Marketplace.type.ts`
- Schemas con Zod para:
  - `marketplace_credentials`
  - `marketplace_listings`
  - `marketplace_orders`

### ✅ API Routes
- `POST /api/marketplaces/mercadolibre/connect` - Inicia OAuth
- `GET /api/marketplaces/mercadolibre/auth/callback` - Callback OAuth
- `GET /api/marketplaces/mercadolibre/status` - Estado de conexión
- `POST /api/marketplaces/mercadolibre/disconnect` - Desconectar cuenta

### ✅ Variables de Entorno
- `MELI_CLIENT_ID`
- `MELI_CLIENT_SECRET`
- `MELI_REDIRECT_URI`

---

## 🚀 Próximos Pasos (Para Probar)

### 1. Crear Aplicación en MercadoLibre

1. Ve a: https://developers.mercadolibre.com.mx/
2. Inicia sesión con tu cuenta de MercadoLibre
3. Ve a "Mis aplicaciones" → "Crear nueva aplicación"
4. Completa el formulario:
   - **Nombre**: Filos Inventory
   - **Descripción**: Sistema de gestión de inventario
   - **URL de redirección**: `http://localhost:3000/api/marketplaces/mercadolibre/auth/callback`
   - **Topics**: Selecciona `orders_v2`, `items`, `questions`
5. Una vez creada, obtendrás:
   - **Client ID**
   - **Client Secret**

### 2. Configurar Variables de Entorno

Edita `.env.local`:

```env
MELI_CLIENT_ID=tu_client_id_aqui
MELI_CLIENT_SECRET=tu_client_secret_aqui
MELI_REDIRECT_URI=http://localhost:3000/api/marketplaces/mercadolibre/auth/callback
```

### 3. Probar la Integración

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre en tu navegador:
```
http://localhost:3000/api/marketplaces/mercadolibre/connect
```

3. Deberías ser redirigido a MercadoLibre para autorizar la aplicación

4. Después de autorizar, serás redirigido a:
```
http://localhost:3000/marketplaces?connected=true
```

5. Verifica el estado de conexión:
```bash
curl http://localhost:3000/api/marketplaces/mercadolibre/status
```

### 4. Verificar en MongoDB

Revisa que se haya guardado la credencial:

```javascript
// En MongoDB Compass o mongo shell
db.marketplace_credentials.findOne({ marketplace: 'mercadolibre' })
```

Deberías ver algo como:
```json
{
  "_id": ObjectId("..."),
  "marketplace": "mercadolibre",
  "meliUserId": "123456789",
  "accessToken": "APP_USR-...",
  "refreshToken": "TG-...",
  "expiresAt": ISODate("2025-10-07T12:00:00Z"),
  "siteId": "MLM",
  "nickname": "FILOS_OFICIAL",
  "email": "contacto@filos.com",
  "active": true,
  "connectedAt": ISODate("2025-10-07T06:00:00Z"),
  "lastRefresh": ISODate("2025-10-07T06:00:00Z"),
  "metadata": {
    "firstName": "Filos",
    "lastName": "Store",
    "countryId": "MX",
    "points": 1000,
    "reputation": "green"
  }
}
```

---

## 🧪 Testing Manual

### Test 1: Conectar Cuenta
```bash
# Abrir en navegador
open http://localhost:3000/api/marketplaces/mercadolibre/connect
```

**Resultado esperado**: Redirige a MercadoLibre para autorizar

### Test 2: Verificar Estado
```bash
curl http://localhost:3000/api/marketplaces/mercadolibre/status
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "account": {
      "meliUserId": "123456789",
      "nickname": "FILOS_OFICIAL",
      "email": "contacto@filos.com",
      "siteId": "MLM",
      "connectedAt": "2025-10-07T06:00:00.000Z",
      "stats": {
        "totalListings": 0,
        "activeListings": 0,
        "salesThisMonth": 0
      }
    }
  }
}
```

### Test 3: Desconectar Cuenta
```bash
curl -X POST http://localhost:3000/api/marketplaces/mercadolibre/disconnect
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "message": "Cuenta de MercadoLibre desconectada exitosamente"
  }
}
```

---

## 🔐 Token Management

El servicio incluye **auto-refresh de tokens**:

- Los tokens de MercadoLibre expiran cada **6 horas**
- El servicio automáticamente refresca el token cuando:
  - Queda menos de 1 hora para expirar
  - Se llama a `getValidCredentials()`
- El nuevo token se guarda automáticamente en MongoDB

### Ejemplo de uso en otros servicios:

```typescript
import { MercadoLibreAuthService } from '@/services/marketplaces/mercadolibre/MercadoLibreAuthService';

// Esto siempre devuelve un token válido (refresca si es necesario)
const accessToken = await MercadoLibreAuthService.getValidCredentials();

// Usar el token para llamar a la API de MercadoLibre
const response = await fetch('https://api.mercadolibre.com/items/search', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

---

## 📚 Recursos Útiles

### Documentación Oficial
- **MercadoLibre API**: https://developers.mercadolibre.com.mx/
- **OAuth 2.0**: https://developers.mercadolibre.com.mx/es_ar/autenticacion-y-autorizacion
- **Crear App**: https://developers.mercadolibre.com.mx/devcenter

### Endpoints de MercadoLibre
- **Auth URL**: `https://auth.mercadolibre.com.mx/authorization`
- **Token URL**: `https://api.mercadolibre.com/oauth/token`
- **User Info**: `https://api.mercadolibre.com/users/me`
- **Items API**: `https://api.mercadolibre.com/items`

---

## 🐛 Troubleshooting

### Error: "MercadoLibre credentials not configured"
**Solución**: Verifica que `.env.local` tenga las variables `MELI_CLIENT_ID`, `MELI_CLIENT_SECRET`, `MELI_REDIRECT_URI`

### Error: "redirect_uri mismatch"
**Solución**:
1. Ve a tu aplicación en MercadoLibre Developers
2. Verifica que la URL de redirección sea exactamente: `http://localhost:3000/api/marketplaces/mercadolibre/auth/callback`
3. Para producción, actualiza a tu dominio real

### Error: "Failed to refresh token"
**Solución**: El refresh token puede haber expirado. Desconecta y vuelve a conectar la cuenta.

### MongoDB no guarda las credenciales
**Solución**: Verifica que MongoDB esté corriendo y que la conexión en `mongodb/index.ts` sea correcta.

---

## ✨ Lo que viene en Fase 2

- [ ] `MercadoLibreListingService` - Crear/actualizar publicaciones
- [ ] Category Predictor - Predicción automática de categorías
- [ ] API routes para CRUD de listings
- [ ] Mapeo de productos Filos → MercadoLibre
- [ ] Subida de imágenes

**Fase 1 Completada** ✅
**Fecha**: 2025-10-07
