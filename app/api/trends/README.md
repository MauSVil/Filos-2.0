# API de Tendencias

API endpoints para consultar análisis de tendencias de suéteres almacenados en MongoDB.

## Endpoints

### 1. GET `/api/trends`
Obtiene lista de todos los análisis de tendencias disponibles (solo metadatos).

**Query Parameters:**
- `limit` (opcional): Número de registros a obtener (default: todos)
- `sort` (opcional): `'asc'` | `'desc'` (default: `'desc'` - más recientes primero)

**Ejemplo Request:**
```bash
GET /api/trends
GET /api/trends?limit=10
GET /api/trends?sort=asc&limit=5
```

**Ejemplo Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "671e8a9f3b2d4c001f8e4567",
      "date": "2025-10-16",
      "timestamp": "2025-10-16T02:23:14.756Z",
      "category": "suéteres",
      "imageStats": {
        "totalTermsSearched": 15,
        "totalImagesFound": 75,
        "termsWithImages": 15,
        "termsWithoutImages": 0
      },
      "metadata": {
        "generatedAt": "2025-10-16T02:23:14.756Z"
      }
    }
  ],
  "count": 1
}
```

---

### 2. GET `/api/trends/latest`
Obtiene el análisis de tendencias más reciente (completo).

**Ejemplo Request:**
```bash
GET /api/trends/latest
```

**Ejemplo Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-10-16",
    "timestamp": "2025-10-16T02:23:14.756Z",
    "category": "suéteres",
    "topTermsWithImages": [
      {
        "query": "sueter tejido",
        "value": 100,
        "type": "top",
        "images": [
          {
            "url": "https://...",
            "thumbnail": "https://...",
            "title": "Suéter tejido negro",
            "price": "$899.00",
            "shop": "Zara"
          }
        ]
      }
    ],
    "imageStats": {
      "totalTermsSearched": 15,
      "totalImagesFound": 75,
      "termsWithImages": 15,
      "termsWithoutImages": 0
    },
    "trendingSearches": [],
    "relatedQueries": {
      "top": [...],
      "rising": [...]
    }
  }
}
```

---

### 3. GET `/api/trends/[id]`
Obtiene un análisis de tendencias específico por ID (completo).

**Path Parameters:**
- `id`: MongoDB ObjectId del análisis (ejemplo: `671e8a9f3b2d4c001f8e4567`)

**Ejemplo Request:**
```bash
GET /api/trends/671e8a9f3b2d4c001f8e4567
```

**Ejemplo Response:**
```json
{
  "success": true,
  "data": {
    "_id": "671e8a9f3b2d4c001f8e4567",
    "date": "2025-10-16",
    "timestamp": "2025-10-16T02:23:14.756Z",
    "category": "suéteres",
    "topTermsWithImages": [...],
    "imageStats": {...},
    "trendingSearches": [...],
    "relatedQueries": {...}
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "message": "No se encontró análisis con ID 671e8a9f3b2d4c001f8e4567",
    "devMessage": "No trend found for ID: 671e8a9f3b2d4c001f8e4567"
  }
}
```

**Error Response (400 - ID inválido):**
```json
{
  "success": false,
  "error": {
    "message": "ID inválido",
    "devMessage": "Invalid MongoDB ObjectId format"
  }
}
```

---

### 4. GET `/api/trends/stats`
Obtiene estadísticas generales de todos los análisis.

**Ejemplo Request:**
```bash
GET /api/trends/stats
```

**Ejemplo Response:**
```json
{
  "success": true,
  "data": {
    "totalAnalyses": 1,
    "firstAnalysis": "2025-10-16",
    "latestAnalysis": "2025-10-16",
    "totalImages": 75,
    "totalTerms": 15,
    "averageImagesPerAnalysis": 75
  }
}
```

---

## Estructura de Datos

### TrendAnalysis (completo)
```typescript
interface TrendAnalysis {
  date: string;                    // YYYY-MM-DD
  timestamp: string;               // ISO 8601
  category: string;                // "suéteres"
  topTermsWithImages: TermWithImages[];
  imageStats: ImageStats;
  trendingSearches: TrendingSearch[];
  relatedQueries: {
    top: RelatedQuery[];
    rising: RelatedQuery[];
  };
  metadata?: {
    searchesUsed: number;
    generatedAt: Date;
    syncedFrom?: string;
    syncedAt?: string;
  };
}
```

### TermWithImages
```typescript
interface TermWithImages {
  query: string;
  value: number;                   // Interés 0-100
  type: 'top' | 'rising';
  growth?: string;
  images: ProductImage[];
}
```

### ProductImage
```typescript
interface ProductImage {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  price?: string;
  shop?: string;
  rating?: number;
  reviews?: number;
  position?: number;
}
```

### ImageStats
```typescript
interface ImageStats {
  totalTermsSearched: number;
  totalImagesFound: number;
  termsWithImages: number;
  termsWithoutImages: number;
}
```

---

## Casos de Uso Frontend

### 1. Listar todos los análisis disponibles
```typescript
// Mostrar tabla con lista de análisis
const response = await fetch('/api/trends');
const { data } = await response.json();

// data es un array con metadatos de cada análisis
// [{_id, date, timestamp, imageStats}, ...]
```

### 2. Ver detalles de un análisis específico
```typescript
// Usuario selecciona un análisis de la lista
const selectedId = '671e8a9f3b2d4c001f8e4567'; // del campo _id
const response = await fetch(`/api/trends/${selectedId}`);
const { data } = await response.json();

// data contiene el análisis completo con términos, imágenes, etc.
```

### 3. Mostrar el último análisis
```typescript
// Página de inicio o dashboard
const response = await fetch('/api/trends/latest');
const { data } = await response.json();

// data contiene el análisis más reciente
```

### 4. Mostrar estadísticas generales
```typescript
// Dashboard o página de estadísticas
const response = await fetch('/api/trends/stats');
const { data } = await response.json();

// data: { totalAnalyses, totalImages, averageImagesPerAnalysis, ... }
```

---

## Notas Técnicas

- Todos los endpoints usan MongoDB colección `trends_results`
- Los datos persisten entre deploys (no se almacenan en archivos)
- El campo `_id` de MongoDB se excluye de todas las respuestas
- Formato de fecha estándar: `YYYY-MM-DD` (ISO 8601)
- Todos los endpoints retornan JSON con estructura `{ success, data, error? }`
- Códigos HTTP: 200 (OK), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
