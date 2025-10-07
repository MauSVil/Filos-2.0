# Integración MercadoLibre

Documentación completa de la integración con MercadoLibre para la plataforma Filos.

---

## ✅ Funcionalidades Implementadas

### 1. Autenticación OAuth 2.0
- **Conexión de cuenta** mediante flujo OAuth
- **Refresh token automático** cuando el access token está por expirar
- **Almacenamiento seguro** de credenciales en MongoDB
- **Scopes incluidos**: `offline_access`, `read`, `write`

**Archivos:**
- `services/marketplaces/mercadolibre/MercadoLibreAuthService.ts`
- `app/api/marketplaces/mercadolibre/auth/route.ts`
- `app/api/marketplaces/mercadolibre/callback/route.ts`

### 2. Publicación de Productos
- **Formulario personalizable** antes de publicar con los siguientes campos:
  - Título (máx 60 caracteres)
  - Descripción
  - Precio
  - Stock/Cantidad
  - Marca
  - Material (Algodón, Poliéster, Lana, Mezcla, Lycra, Seda, Otro)
  - Estilo (Casual, Formal, Deportivo, Elegante, Urbano)
  - Largo de manga (Sin mangas, Corta, 3/4, Larga)
  - Temporada (Todas, Primavera/Verano, Otoño/Invierno)
  - Envío gratis (checkbox)
  - Retiro en persona (checkbox)

- **Predicción automática de categoría** basada en el título del producto
- **Categoría fallback**: MLM112197 (Chamarras) si la predicción falla
- **Mapeo de atributos** personalizados a formato MercadoLibre
- **Subida automática de imágenes** desde MinIO (requiere bucket público)

**Archivos:**
- `services/marketplaces/mercadolibre/MercadoLibreListingService.ts`
- `app/api/marketplaces/mercadolibre/listings/route.ts`
- `app/(private)/products/_components/PublishToMercadoLibreButton.tsx`

### 3. Gestión de Publicaciones
- **Página dedicada** en `/marketplaces/listings` para ver todas las publicaciones
- **Sincronización automática** al cargar la página
- **Botón de sincronización manual** para actualizar en cualquier momento
- **Información mostrada**:
  - Estado (Activa/Pausada/Cerrada)
  - Precio actual
  - Stock disponible
  - Cantidad vendida
  - Categoría
  - Imágenes
  - Link directo a MercadoLibre
  - Link para editar el producto

**Archivos:**
- `app/(private)/marketplaces/listings/page.tsx`
- `app/api/marketplaces/mercadolibre/listings/all/route.ts`

### 4. Sincronización Bidireccional
- **Desde MercadoLibre → Plataforma**:
  - Precio
  - Stock disponible
  - Cantidad vendida
  - Estado (active/paused/closed)
  - Imágenes
  - Categoría

- **Desde Plataforma → MercadoLibre**:
  - Cerrar publicación al eliminar
  - Crear nueva publicación
  - Actualizar datos (por implementar)

**Archivos:**
- `app/api/marketplaces/mercadolibre/listings/sync-all/route.ts`
- `app/api/marketplaces/mercadolibre/listings/sync/route.ts`
- `app/api/marketplaces/mercadolibre/listings/[listingId]/route.ts`

### 5. Operaciones sobre Publicaciones
- ✅ Crear publicación
- ✅ Obtener detalles de publicación
- ✅ Cerrar/Eliminar publicación
- ✅ Sincronizar estado
- ⚠️ Actualizar precio (método existe, UI pendiente)
- ⚠️ Actualizar stock (método existe, UI pendiente)
- ⚠️ Pausar/Activar (método existe, UI pendiente)

### 6. Interfaz de Usuario
- **Botón "Publicar en ML"** en tabla de productos
- **Modal con formulario** para editar datos antes de publicar
- **Página de publicaciones** con cards visuales
- **Badges de estado** con colores (verde=activa, gris=pausada, rojo=cerrada)
- **Botón de eliminar** con confirmación
- **Acceso desde** `/marketplaces` con botón "Ver publicaciones"

---

## 🔄 Flujo Completo de Uso

### 1. Conectar Cuenta
1. Ir a `/marketplaces`
2. Clic en "Conectar MercadoLibre"
3. Autorizar en MercadoLibre
4. Redirect automático con confirmación

### 2. Publicar Producto
1. Ir a `/products`
2. Clic en "Publicar en ML" en el producto deseado
3. Revisar/editar formulario con datos pre-llenados
4. Clic en "Publicar ahora"
5. Esperar confirmación y ver link a publicación

### 3. Ver y Gestionar Publicaciones
1. Ir a `/marketplaces` → "Ver publicaciones"
2. Ver todas las publicaciones sincronizadas
3. Clic en "Ver en ML" para abrir en MercadoLibre
4. Clic en "Editar" para modificar el producto
5. Clic en icono de basura para cerrar/eliminar

### 4. Sincronización Automática
- Al abrir `/marketplaces/listings`, se sincronizan todas las publicaciones
- Clic en "Sincronizar" para actualizar manualmente
- Los cambios en MercadoLibre se reflejan en la plataforma

---

## ⚠️ Consideraciones Importantes

### Imágenes
- Las imágenes deben estar en **MinIO con bucket público**
- MercadoLibre descarga las imágenes desde la URL proporcionada
- Si el bucket no es público, la publicación se creará sin imagen

### Categorías
- La categoría se predice automáticamente usando el API de MercadoLibre
- Categoría fallback: **MLM112197** (Chamarras)
- MercadoLibre puede ajustar la categoría automáticamente si detecta una mejor opción
- Algunas categorías requieren atributos específicos (ej: SIZE_GRID_ID para fashion)

### Atributos
- Los atributos enviados son: BRAND, MODEL, GENDER, COLOR, SIZE
- Atributos opcionales según formulario: MATERIAL, STYLE, SLEEVE_LENGTH, SEASON
- Algunos atributos pueden no ser aceptados por ciertas categorías

### Tokens OAuth
- El **access token expira** después de 6 horas
- El sistema **refresca automáticamente** si falta menos de 1 hora
- El **refresh token** es válido indefinidamente (mientras se use)

### Políticas de MercadoLibre
- Errores de **PA_UNAUTHORIZED_RESULT_FROM_POLICIES** indican falta de permisos
- Asegurarse de tener los scopes correctos al conectar
- Cuentas nuevas pueden tener restricciones temporales

---

## 📋 Pendientes / Por Implementar

### Alta Prioridad
1. **Sincronización de stock bidireccional**
   - Cuando haya venta en ML → Reducir stock en tabla `products`
   - Cuando cambies stock en plataforma → Actualizar en ML

2. **Actualización de precios desde la plataforma**
   - UI para cambiar precio de publicación
   - Botón "Actualizar precio en ML"

3. **Pausar/Activar publicaciones desde la plataforma**
   - Botón toggle para pausar/activar
   - Útil para gestionar inventario temporalmente

4. **Manejo de errores mejorado**
   - Mostrar mensajes más descriptivos al usuario
   - Logging de errores para debugging
   - Retry automático en caso de fallo

5. **Validación de stock antes de publicar**
   - No permitir publicar productos sin stock
   - Advertencia si stock es bajo

### Media Prioridad
6. **Webhooks de MercadoLibre**
   - Recibir notificaciones de ventas en tiempo real
   - Actualizar stock automáticamente sin necesidad de sincronización manual
   - Notificar nuevas preguntas de compradores

7. **Publicación masiva**
   - Seleccionar múltiples productos y publicar en batch
   - Progreso visual de publicaciones

8. **Templates de descripción**
   - Guardar plantillas de descripción
   - Reutilizar para productos similares

9. **Gestión de preguntas**
   - Ver preguntas de compradores
   - Responder desde la plataforma

10. **Análisis y reportes**
    - Dashboard con estadísticas de ventas
    - Productos más vendidos
    - Rendimiento por categoría

### Baja Prioridad
11. **Publicaciones con variaciones**
    - Soporte para múltiples colores/tallas en una sola publicación
    - Requiere SIZE_GRID_ID y configuración compleja

12. **Promociones y descuentos**
    - Crear ofertas desde la plataforma
    - Gestionar descuentos temporales

13. **Envío gratis automático**
    - Configurar reglas para envío gratis
    - Basado en precio mínimo o categoría

14. **Múltiples cuentas de MercadoLibre**
    - Soporte para conectar varias cuentas
    - Seleccionar cuenta al publicar

---

## 🚀 Sugerencias de Mejora

### Arquitectura
1. **Implementar queue system** (Bull/BullMQ)
   - Procesar sincronizaciones en background
   - Evitar timeouts en operaciones largas
   - Retry automático en caso de fallo

2. **Cache de categorías**
   - Guardar categorías predichas para evitar consultas repetidas
   - Reducir latencia al publicar

3. **Event-driven updates**
   - Usar eventos para propagar cambios de stock
   - Mantener consistencia entre sistemas

### UX/UI
4. **Wizard de publicación**
   - Flujo paso a paso para primera publicación
   - Explicar cada campo y su importancia

5. **Vista previa de publicación**
   - Mostrar cómo se verá en MercadoLibre antes de publicar
   - Simular la tarjeta de producto

6. **Filtros en página de publicaciones**
   - Filtrar por estado (activa/pausada/cerrada)
   - Buscar por título o SKU
   - Ordenar por ventas, precio, fecha

7. **Notificaciones push**
   - Alertas cuando hay ventas
   - Notificaciones de problemas con publicaciones
   - Recordatorios de stock bajo

### Integración
8. **Sincronización programada**
   - Cron job para sincronizar cada X horas
   - No depender de que el usuario abra la página

9. **Logs de auditoría**
   - Registrar todas las operaciones
   - Historial de cambios de precio/stock
   - Útil para resolver disputas

10. **Testing automatizado**
    - Tests unitarios para servicios
    - Tests de integración con API mock
    - Tests E2E del flujo completo

### Seguridad
11. **Encriptación de tokens**
    - Encriptar access_token y refresh_token en BD
    - Usar variables de entorno para claves

12. **Rate limiting**
    - Limitar llamadas al API de MercadoLibre
    - Evitar bloqueos por exceso de requests

13. **Validación de webhooks**
    - Verificar firma de webhooks de ML
    - Prevenir requests maliciosos

---

## 🗄️ Estructura de Base de Datos

### Collection: `marketplace_credentials`
```typescript
{
  marketplace: 'mercadolibre',
  meliUserId: string,           // ID del vendedor en ML
  accessToken: string,           // TODO: Encriptar
  refreshToken: string,          // TODO: Encriptar
  expiresAt: Date,              // Cuándo expira el access token
  siteId: 'MLM',                // México
  nickname: string,              // Nombre de usuario ML
  email: string,
  active: boolean,
  connectedAt: Date,
  lastRefresh: Date,
  metadata: {
    firstName: string,
    lastName: string,
    countryId: string,
    points: number,
    reputation: string
  }
}
```

### Collection: `marketplace_listings`
```typescript
{
  productId: ObjectId,           // Referencia a products
  marketplace: 'mercadolibre',
  externalId: string,            // ID de la publicación en ML (ej: MLM123456789)
  sku: string,                   // uniqId del producto
  permalink: string,             // URL pública de la publicación
  status: 'active' | 'paused' | 'closed',
  categoryId: string,            // ID de categoría ML
  listingType: string,           // Tipo de publicación (gold_special, etc)
  price: number,
  availableQuantity: number,
  soldQuantity: number,
  createdAt: Date,
  lastSync: Date,
  syncErrors: [],
  metadata: {
    title: string,
    pictures: string[],
    attributes: Array<{id: string, value_name: string}>,
    shippingMode: string,
    condition: string
  }
}
```

---

## 📚 Referencias

### Documentación MercadoLibre
- [API Reference](https://developers.mercadolibre.com.ar/es_ar/api-docs)
- [Autenticación OAuth](https://developers.mercadolibre.com.ar/es_ar/autenticacion-y-autorizacion)
- [Items API](https://developers.mercadolibre.com.ar/es_ar/items-y-busquedas)
- [Categorías](https://developers.mercadolibre.com.ar/es_ar/categorias-y-atributos)

### Variables de Entorno Requeridas
```env
MELI_CLIENT_ID=your_client_id
MELI_CLIENT_SECRET=your_client_secret
MELI_REDIRECT_URI=http://localhost:3000/api/marketplaces/mercadolibre/callback
MELI_TEST_MODE=false
```

---

## 🐛 Problemas Conocidos

1. **Publicaciones sin imagen**
   - Causa: MinIO bucket no público
   - Solución: Configurar bucket como público o usar CDN

2. **Error PA_UNAUTHORIZED_RESULT_FROM_POLICIES**
   - Causa: Falta de permisos o scopes incorrectos
   - Solución: Reconectar cuenta con scopes `offline_access read write`

3. **Categoría MLM1911 cambiada automáticamente**
   - Causa: MercadoLibre detecta mejor categoría
   - Comportamiento esperado: Es normal y beneficioso

4. **Publicaciones "cerradas" automáticamente**
   - Causa: Moderación de ML o verificación de seguridad
   - Solución: Completar verificación facial si se solicita

---

## 📝 Changelog

### 2025-01-07
- ✅ Implementada integración completa con MercadoLibre
- ✅ OAuth 2.0 con refresh automático
- ✅ Formulario personalizable para publicaciones
- ✅ Sincronización bidireccional
- ✅ Página de gestión de publicaciones
- ✅ Cierre de publicaciones desde plataforma
- ✅ Predicción automática de categorías
- ❌ Removido modo sandbox (no útil para testing real)
- 🔧 Categoría fallback cambiada a MLM112197 (Chamarras)

---

**Última actualización:** 2025-01-07
**Versión:** 1.0.0
**Estado:** En producción
