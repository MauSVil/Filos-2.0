# Plan de Implementación: Sistema de Descubrimiento de Tendencias

## 🎯 Objetivo
Crear una sección de "Descubrimiento de Tendencias" que analice fuentes externas para identificar qué está de moda en el mercado de suéteres.

---

## 📊 Stack de APIs Recomendado

### 1. **Google Trends API** (GRATIS)
- **Uso**: Detectar términos de búsqueda populares
- **Ejemplos**: "oversized sweater", "cropped cardigan", "turtleneck"
- **Ventaja**: Datos reales de búsquedas, gratis
- **Implementación**: `google-trends-api` npm package

### 2. **Reddit API** (GRATIS)
- **Uso**: Analizar subreddits de moda (r/fashion, r/streetwear, r/femalefashionadvice)
- **Ventaja**: Conversaciones orgánicas sobre tendencias
- **Implementación**: `snoowrap` npm package

### 3. **OpenAI GPT-4** (DE PAGO)
- **Uso**:
  - Analizar y resumir datos de otras APIs
  - Generar insights y recomendaciones
  - Traducir tendencias globales a tu catálogo
  - Sugerir qué productos fabricar/comprar
- **Ventaja**: Inteligencia para interpretar datos
- **Costo**: ~$0.01-0.03 por análisis

### 4. **Serper.dev** (OPCIONAL - DE PAGO)
- **Uso**: Búsquedas de Google Shopping, imágenes, noticias
- **Ventaja**: Ver qué están vendiendo competidores
- **Costo**: ~$50/mes por 5000 búsquedas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│  Frontend: Trends Dashboard                 │
│  /app/(private)/trends                      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  API Routes: /api/trends                    │
│  - /search    (trigger analysis)            │
│  - /latest    (get cached results)          │
│  - /refresh   (force update)                │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Services Layer                             │
│  - TrendDiscoveryService                    │
│  - GoogleTrendsService                      │
│  - RedditAnalysisService                    │
│  - OpenAIInsightsService                    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  MongoDB Collections                        │
│  - trends (cached results)                  │
│  - trend_history (historical)               │
└─────────────────────────────────────────────┘
```

---

## 📝 Plan de Implementación

### **✅ Fase 1: Fundación (Semana 1)** - CURRENT

#### Backend Structure
**Servicios a crear:**
```
services/trends/
├── GoogleTrendsService.ts      # Integración con Google Trends
├── RedditService.ts            # Integración con Reddit API
├── OpenAIAnalyzerService.ts    # Análisis con OpenAI
└── TrendAggregatorService.ts   # Combina todas las fuentes
```

#### MongoDB Collection Schema
```typescript
// Collection: trends
{
  _id: ObjectId,
  generatedAt: Date,
  expiresAt: Date,            // TTL: 24 horas
  category: "sweaters",
  sources: {
    googleTrends: {
      keywords: [
        { term: string, value: number, growth: number }
      ],
      relatedQueries: string[],
      timestamp: Date
    },
    reddit: {
      topPosts: [
        { title: string, subreddit: string, upvotes: number, url: string }
      ],
      keyMentions: string[],
      timestamp: Date
    },
    aiAnalysis: {
      summary: string,
      insights: string[],
      timestamp: Date
    }
  },
  insights: {
    topKeywords: string[],
    risingStyles: string[],
    popularColors: string[],
    recommendations: string[],
    trendScore: number
  },
  status: "processing" | "completed" | "failed",
  error?: string
}

// Collection: trend_history (para análisis temporal)
{
  _id: ObjectId,
  date: Date,
  snapshot: { /* copia de trends */ }
}
```

#### Términos de Búsqueda para Google Trends
```typescript
const SWEATER_KEYWORDS = [
  "oversized sweater",
  "cropped cardigan",
  "cable knit sweater",
  "turtleneck sweater",
  "v-neck sweater",
  "cashmere sweater",
  "chunky knit",
  "ribbed sweater",
  "color block sweater",
  "striped sweater",
  "mock neck sweater",
  "sweater vest"
];
```

#### API Routes
```
POST   /api/trends/generate    # Genera nuevo análisis
GET    /api/trends/latest      # Obtiene último análisis
POST   /api/trends/refresh     # Fuerza actualización
GET    /api/trends/history     # Histórico
```

#### Frontend
**Ruta:** `/app/(private)/trends/page.tsx`

**Estructura inicial:**
```
app/(private)/trends/
├── page.tsx
├── _components/
│   ├── Content.tsx
│   ├── TrendInsightCard.tsx
│   ├── KeywordsList.tsx
│   └── RecommendationsPanel.tsx
└── _modules/
    └── useModule.ts
```

---

### **Fase 2: Integración Reddit + OpenAI (Semana 2)**

#### Reddit Integration
- Conectar a subreddits: r/fashion, r/streetwear, r/femalefashionadvice, r/malefashionadvice
- Buscar posts con keywords sobre suéteres
- Filtrar por engagement (>100 upvotes últimos 7 días)
- Extraer términos mencionados frecuentemente

#### OpenAI Analyzer
**Prompt template:**
```
Analiza estos datos de tendencias de moda en suéteres:

GOOGLE TRENDS:
{googleTrendsData}

REDDIT DISCUSSIONS:
{redditPosts}

Como experto en moda y análisis de mercado, proporciona:

1. **Top 5 Estilos Trending**: Estilos de suéter más populares actualmente
2. **Colores Populares**: Colores que están en tendencia
3. **Recomendaciones de Inventario**: Qué productos específicos debería considerar fabricar o comprar
4. **Predicción**: Tendencias anticipadas para los próximos 3 meses
5. **Oportunidades**: Nichos o estilos con baja competencia pero creciente interés

Formato: JSON estructurado
```

#### Aggregator Logic
- Combinar datos de todas las fuentes
- Calcular "trend score" basado en múltiples señales
- Identificar tendencias emergentes (crecimiento >50% en 7 días)
- Cache en MongoDB con TTL de 24 horas

---

### **Fase 3: Dashboard UI + Galería de Imágenes (Semana 3)** ✅ COMPLETADO

#### Componentes del Dashboard

**1. Hero Section** ✅
```
┌─────────────────────────────────────────────┐
│  👑 Tendencia Principal del Momento         │
│  "Suéter Oversize +21% en búsquedas"       │
│  [Badge: +21%]                              │
└─────────────────────────────────────────────┘
```

**2. Stats Grid (4 Cards)** ✅
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Puntuación   │ Búsquedas    │ Estilos en   │ Colores de   │
│ Tendencia    │ Activas      │ Ascenso      │ Moda         │
│ 46/100       │ 10           │ 1            │ 5            │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**3. Búsquedas Más Populares** ✅
```
📊 Lo que más está buscando la gente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1 Cardigan              [77 búsquedas]
#2 Suéter mujer          [73 búsquedas]
#3 Suéter oversize       [64 búsquedas]
```

**4. Estilos en Crecimiento** ✅
```
📈 Suéteres que cada vez buscan más personas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↗️ Suéter Oversize       [+21%]
```

**5. Recomendaciones para tu Negocio** ✅
```
💡 Qué productos deberías considerar comprar o fabricar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Aumentar: Considera aumentar inventario de X
⚠️ Alerta: Estilos en declive
🎯 Oportunidad: Nichos con baja competencia
```

**6. Colores de Moda** ✅
```
🎨 Los colores que más están buscando en suéteres
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Beige] [Negro] [Gris] [Café] [Navy]
```

---

### **Fase 3.5: Galería de Imágenes de Tendencias (Semana 3.5)** - PRÓXIMO

#### Objetivo
Mostrar imágenes visuales de los estilos trending para que el usuario pueda:
- Ver cómo lucen los suéteres de moda
- Inspirarse para diseñar/comprar inventario
- Entender visualmente las tendencias

#### Solución Elegida: Unsplash API

**Por qué Unsplash:**
- ✅ **GRATIS**: 50 requests/hora (suficiente para el caso de uso)
- ✅ **Alta calidad**: Fotos profesionales de moda
- ✅ **Fácil implementación**: API REST simple
- ✅ **Sin costos mensuales**: Perfecto para MVP
- ✅ **Contenido relevante**: Amplia colección de fotos de moda y suéteres
- ✅ **Sin aprobación compleja**: Solo registrarse

**Alternativas para el futuro:**
- **Serper API** ($50/mes): Imágenes de Google Shopping, más específicas
- **DALL-E** ($0.04/imagen): Generar imágenes personalizadas
- **Pinterest API**: Requiere aprobación, más complejo

#### Arquitectura de Imágenes

```
┌─────────────────────────────────────────────┐
│  Frontend: Image Gallery Component          │
│  - Masonry layout (Pinterest style)         │
│  - Lightbox para zoom                       │
│  - Loading skeletons                        │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  API Route: /api/trends/images              │
│  - GET: Obtiene imágenes para keyword       │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Service: UnsplashImageService              │
│  - searchImages(query, count)               │
│  - Cache en MongoDB (7 días)                │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Unsplash API                               │
│  https://api.unsplash.com/search/photos     │
└─────────────────────────────────────────────┘
```

#### Schema de Imágenes en MongoDB

```typescript
// Collection: trend_images
{
  _id: ObjectId,
  keyword: string,              // "sueter oversize"
  images: [
    {
      id: string,                // Unsplash image ID
      url: string,               // URL de la imagen
      thumbnailUrl: string,      // URL thumbnail
      description: string,       // Descripción
      photographer: string,      // Crédito
      photographerUrl: string,   // Link al fotógrafo
      width: number,
      height: number
    }
  ],
  fetchedAt: Date,
  expiresAt: Date               // TTL: 7 días
}
```

#### Componentes UI

**1. Image Gallery Card**
```
┌─────────────────────────────────────────────┐
│  📸 Inspiración Visual: Suéter Oversize     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │IMG │ │IMG │ │IMG │                      │
│  │ 1  │ │ 2  │ │ 3  │                      │
│  └────┘ └────┘ └────┘                      │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │IMG │ │IMG │ │IMG │                      │
│  │ 4  │ │ 5  │ │ 6  │                      │
│  └────┘ └────┘ └────┘                      │
│                                             │
│  [Ver más imágenes →]                       │
└─────────────────────────────────────────────┘
```

**2. Image Lightbox Modal**
- Click en imagen → Modal fullscreen
- Controles: Anterior/Siguiente
- Mostrar crédito del fotógrafo
- Botón "Cerrar"

**3. Multiple Galleries**
- Una galería por cada Top 3 trending keywords
- Lazy loading (cargar al hacer scroll)
- Responsive: 3 columnas desktop, 2 mobile

#### Implementación Técnica

**Step 1: Setup Unsplash**
```bash
pnpm add unsplash-js
```

**Step 2: Variables de Entorno**
```env
UNSPLASH_ACCESS_KEY=your_access_key
```

**Step 3: Service Layer**
```typescript
// services/trends/UnsplashImageService.ts
import { createApi } from 'unsplash-js';

export class UnsplashImageService {
  private unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY!
  });

  async searchImages(query: string, count: number = 6) {
    const result = await this.unsplash.search.getPhotos({
      query: `${query} sweater fashion`,
      perPage: count,
      orientation: 'portrait'
    });

    return result.response?.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      description: photo.description || photo.alt_description,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      width: photo.width,
      height: photo.height
    })) || [];
  }
}
```

**Step 4: API Route**
```typescript
// app/api/trends/images/route.ts
GET /api/trends/images?keyword=sueter+oversize&count=6
```

**Step 5: UI Component**
```typescript
// app/(private)/trends/_components/ImageGallery.tsx
- Masonry grid layout
- Image hover effects
- Click to lightbox
- Attribution footer
```

#### UX Considerations

1. **Loading States**: Mostrar skeleton mientras cargan imágenes
2. **Error Handling**: Fallback a placeholder si Unsplash falla
3. **Performance**: Lazy load imágenes fuera de viewport
4. **Attribution**: Siempre dar crédito a fotógrafos (requerido por Unsplash)
5. **Cache**: 7 días para evitar requests repetidos

#### Timeline

| Task | Duración | Prioridad |
|------|----------|-----------|
| Setup Unsplash + Service | 1 hora | Alta |
| API Route + Caching | 1 hora | Alta |
| Image Gallery Component | 2 horas | Alta |
| Lightbox Modal | 1 hora | Media |
| Integration + Testing | 1 hora | Alta |
| **Total** | **6 horas** | - |

#### Checklist de Implementación

- [ ] Registrarse en Unsplash Developers
- [ ] Obtener API Access Key
- [ ] Instalar `unsplash-js`
- [ ] Crear UnsplashImageService
- [ ] Crear API route `/api/trends/images`
- [ ] Implementar cache en MongoDB
- [ ] Crear ImageGallery component
- [ ] Crear Lightbox modal component
- [ ] Integrar en dashboard de trends
- [ ] Testing de responsive design
- [ ] Testing de attribution requirements

---

---

### **Fase 4: Automatización y Refinamiento (Semana 4)**

#### Cron Jobs
```typescript
// Actualizar trends diariamente a las 6am
schedule.scheduleJob('0 6 * * *', async () => {
  await TrendAggregatorService.generateTrends();
});

// Limpiar datos antiguos semanalmente
schedule.scheduleJob('0 0 * * 0', async () => {
  await cleanupOldTrends();
});
```

#### Notificaciones
- Email cuando se detecta tendencia emergente (>100% growth)
- Dashboard badge indicator para nuevos insights
- Push notification opcional

#### Comparativa Temporal
```
📊 Comparativa: Diciembre vs Noviembre
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↗️ Cable knit:        +45%
↗️ Turtleneck:        +32%
↘️ V-neck:            -12%
→  Cardigan:          +2%
```

#### Export Features
- Generar PDF de reporte semanal
- Export CSV de keywords trending
- Share link para compartir con equipo

---

## 💰 Costos Estimados

| Servicio | Costo Mensual | Límite |
|----------|---------------|--------|
| Google Trends | GRATIS | Unlimited (rate limited) |
| Reddit API | GRATIS | 60 req/min |
| OpenAI GPT-4o-mini | $5-15 | ~100-300 análisis/mes |
| Serper (opcional) | $50 | 5000 búsquedas |
| **Total** | **$55-65** | - |

---

## 🚀 Ventajas del Sistema

1. **Multi-fuente**: No dependes de una sola API
2. **OpenAI como cerebro**: Interpreta datos crudos y genera insights accionables
3. **Costo controlado**: Mayoría gratis, OpenAI por demanda
4. **Escalable**: Puedes agregar más fuentes después (Pinterest, Instagram, TikTok)
5. **Relevante**: Datos reales de comportamiento de usuarios
6. **Histórico**: Tracking de tendencias a lo largo del tiempo
7. **Accionable**: Recomendaciones específicas para tu inventario

---

## 📦 Dependencias NPM

```json
{
  "google-trends-api": "^4.9.2",
  "snoowrap": "^1.23.0",
  "openai": "^4.20.0",
  "node-schedule": "^2.1.1",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0"
}
```

---

## 🔐 Variables de Entorno

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Reddit API (crear app en https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=FilosTrendBot/1.0

# Serper (opcional)
SERPER_API_KEY=...
```

---

## 🎯 Métricas de Éxito

### KPIs del Sistema
- Tiempo de generación de trends: <30 segundos
- Precisión de recomendaciones: Validar con ventas reales
- Frecuencia de uso: Daily active usage
- Impacto en decisiones de compra: Track productos comprados basados en recomendaciones

### Validación
- Comparar trends detectados vs ventas reales (lag de 2-4 semanas)
- Feedback del equipo sobre utilidad de insights
- A/B test: Decisiones con trends vs sin trends

---

## 🔮 Futuras Mejoras (Post V1)

1. **Instagram Scraping**: Hashtags trending en moda
2. **TikTok API**: Videos virales sobre outfits
3. **Pinterest Trends**: Qué están guardando usuarios
4. **Competitor Monitoring**: Precios y productos de competencia
5. **Predicción ML**: Modelo predictivo basado en histórico
6. **Integración con Inventory**: Auto-sugerencias de reabastecimiento
7. **Multi-idioma**: Trends en español, inglés, etc.
8. **Regional Trends**: Tendencias por país/región

---

## 📅 Timeline Resumen

| Fase | Duración | Entregables |
|------|----------|-------------|
| Fase 1 | Semana 1 | Backend structure, Google Trends, Basic UI |
| Fase 2 | Semana 2 | Reddit + OpenAI integration, Aggregator logic |
| Fase 3 | Semana 3 | Complete dashboard, Visualizations, UX polish |
| Fase 4 | Semana 4 | Automation, Notifications, Reports, Testing |

**Total: 4 semanas para MVP completo**

---

## 👥 Equipo Necesario

- 1 Backend Developer (APIs, Services, DB)
- 1 Frontend Developer (UI, Dashboard, Charts)
- Acceso a APIs (OpenAI, Reddit)

---

## ✅ Checklist Fase 1

- [ ] Instalar dependencias npm
- [ ] Crear estructura de servicios
- [ ] Implementar GoogleTrendsService
- [ ] Crear MongoDB collections
- [ ] Crear API routes básicas
- [ ] Implementar TrendAggregatorService básico
- [ ] Crear página frontend `/trends`
- [ ] Componentes UI básicos
- [ ] Configurar variables de entorno
- [ ] Testing de integración Google Trends
- [ ] Documentar uso interno

---

**Última actualización:** 2025-10-06
**Versión:** 1.0
**Estado:** Fase 1 en progreso
