# 🎯 Script de Análisis de Tendencias de Suéteres

Script standalone que analiza tendencias de suéteres en México usando Google Trends y Google Shopping.

**Todo se guarda en MongoDB** - Persiste entre deploys y reinicios.

## 📦 Archivos

- `standalone-trends.ts` - Script principal que ejecuta el análisis
- `query-results.ts` - Script para consultar resultados desde MongoDB
- `README.md` - Esta documentación

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
SERPAPI_KEY=tu_api_key_de_serpapi
MONGODB_URI=mongodb://usuario:password@host:puerto/database
```

### Variables Opcionales

```bash
MAX_TERMS_FOR_IMAGES=20      # Número de términos a buscar imágenes (default: 20)
MAX_IMAGES_PER_TERM=5         # Imágenes por término (default: 5)
DRY_RUN=true                  # Modo prueba sin gastar búsquedas
```

## 🚀 Uso

### Ejecutar análisis de tendencias

```bash
# Ejecutar análisis normal
npx tsx scripts/trends/standalone-trends.ts

# Con parámetros personalizados
MAX_TERMS_FOR_IMAGES=30 MAX_IMAGES_PER_TERM=10 npx tsx scripts/trends/standalone-trends.ts

# Modo de prueba (sin gastar búsquedas)
DRY_RUN=true npx tsx scripts/trends/standalone-trends.ts
```

### Consultar resultados desde MongoDB

```bash
# Ver el último análisis
npx tsx scripts/trends/query-results.ts

# Ver análisis de una fecha específica
npx tsx scripts/trends/query-results.ts --date 2025-10-16

# Listar todos los análisis disponibles
npx tsx scripts/trends/query-results.ts --list

# Ver estadísticas generales
npx tsx scripts/trends/query-results.ts --stats
```

## 📊 Funcionamiento

### 1. Tracking de Uso (MongoDB)

Los datos de uso se guardan en MongoDB en:
- **Base de datos**: `test`
- **Colección**: `serpapi_usage`
- **Documento**: `{ type: "usage_tracker" }`

**Ventajas**:
- ✅ Persiste entre deploys y reinicios
- ✅ No se pierde cuando actualizas el código
- ✅ Compartido entre todas las instancias del script
- ✅ Reseteo automático cada mes

### 2. Resultados de Tendencias (MongoDB)

Los resultados se guardan en MongoDB en:
- **Base de datos**: `test`
- **Colección**: `trends_results`
- **Documento por fecha**: `{ date: "YYYY-MM-DD", ... }`

**Estructura del documento**:
```json
{
  "date": "2025-10-15",
  "timestamp": "2025-10-15T12:00:00.000Z",
  "category": "suéteres",
  "topTermsWithImages": [...],
  "imageStats": {
    "totalTermsSearched": 20,
    "totalImagesFound": 87,
    "termsWithImages": 18,
    "termsWithoutImages": 2
  },
  "trendingSearches": [...],
  "relatedQueries": {
    "top": [...],
    "rising": [...]
  },
  "metadata": {
    "searchesUsed": 30,
    "generatedAt": "2025-10-15T12:00:00.000Z"
  }
}
```

**Ventajas**:
- ✅ Historial completo de análisis diarios
- ✅ Consultas rápidas por fecha
- ✅ No se pierde nunca (incluso con deploys)
- ✅ Análisis de tendencias a lo largo del tiempo

## 🎛️ Configuración en Coolify

### Cronjob Setup

1. Crea un nuevo servicio de tipo "Command"
2. Configura el cronjob:
   ```bash
   # Ejecutar diariamente a las 2 AM
   0 2 * * * cd /app && npx tsx scripts/trends/standalone-trends.ts
   ```

3. Variables de entorno (en Coolify):
   ```
   SERPAPI_KEY=your_serpapi_key
   MONGODB_URI=your_mongodb_connection_string
   MAX_TERMS_FOR_IMAGES=20
   MAX_IMAGES_PER_TERM=5
   ```

### Límites de Búsqueda

- **Límite mensual**: 250 búsquedas
- **Consumo estimado por ejecución**: ~30 búsquedas
  - 9 búsquedas de related queries
  - 1 búsqueda de trending searches
  - 20 búsquedas de imágenes (configurable)

## 📈 Consultar Datos en MongoDB

### Ver tracking de uso
```bash
# Conectarse a MongoDB
mongosh "mongodb://..."

# Cambiar a la base de datos
use test

# Ver el documento de tracking
db.serpapi_usage.findOne({ type: "usage_tracker" })

# Ver estadísticas
db.serpapi_usage.findOne(
  { type: "usage_tracker" },
  { totalSearches: 1, monthlyLimit: 1, currentMonth: 1, _id: 0 }
)

# Ver historial reciente de búsquedas
db.serpapi_usage.findOne(
  { type: "usage_tracker" },
  { searches: { $slice: -10 } }
)
```

### Ver resultados de tendencias
```bash
# Ver todos los análisis
db.trends_results.find().sort({ date: -1 })

# Ver análisis de hoy
db.trends_results.findOne({ date: "2025-10-15" })

# Ver solo las estadísticas de imágenes
db.trends_results.find(
  {},
  { date: 1, imageStats: 1, _id: 0 }
).sort({ date: -1 })

# Ver los top 5 términos del último análisis
db.trends_results.findOne(
  {},
  {
    date: 1,
    "topTermsWithImages": { $slice: 5 }
  }
).sort({ date: -1 })

# Contar cuántos análisis hay
db.trends_results.countDocuments()

# Ver análisis del último mes
db.trends_results.find({
  date: { $gte: "2025-10-01", $lte: "2025-10-31" }
}).sort({ date: -1 })
```

## 🔄 Reseteo Automático

El script detecta automáticamente el cambio de mes y resetea:
- `totalSearches` → 0
- `searches` → []
- `currentMonth` → nuevo mes
- `lastReset` → timestamp actual

## ⚠️ Troubleshooting

### Error: "MONGODB_URI no está configurado"
```bash
# Verifica que la variable esté presente
echo $MONGODB_URI

# En Coolify, verifica las variables de entorno del servicio
```

### Error: "Límite de SerpAPI excedido"
El script ya consumió las 250 búsquedas del mes. Espera al siguiente mes o ajusta `MAX_TERMS_FOR_IMAGES`.

### Los datos no persisten entre deploys
Esto **ya no debería ocurrir**. Todo está en MongoDB y persiste automáticamente.

Si aún ves pérdida de datos:
1. Verifica que `MONGODB_URI` esté configurado correctamente
2. Verifica que tienes permisos de escritura en la base de datos `test`
3. Verifica las colecciones en MongoDB:
```bash
mongosh "your_mongodb_uri"
> use test
> show collections
> db.serpapi_usage.findOne({ type: "usage_tracker" })
> db.trends_results.find().count()
```

## 📝 Estructura del Documento MongoDB

```typescript
{
  type: "usage_tracker",
  totalSearches: 121,
  monthlyLimit: 250,
  currentMonth: "2025-10",
  searches: [
    {
      timestamp: "2025-10-15T04:43:47.737Z",
      term: "cardigan",
      success: true
    },
    // ... más búsquedas
  ],
  lastReset: "2025-10-15T04:38:29.201Z",
  updatedAt: "2025-10-15T05:22:54.191Z"
}
```

## 🎨 Output Ejemplo

```
═══════════════════════════════════════════════════════════════════════════════
🎯 ANÁLISIS DE TENDENCIAS DE SUÉTERES - MÉXICO
═══════════════════════════════════════════════════════════════════════════════

📊 REPORTE DE USO DE SERPAPI
════════════════════════════════════════════════════════════════
Mes actual: 2025-10
Límite mensual: 250 búsquedas
Búsquedas realizadas: 121
Búsquedas restantes: 129
Uso: 48.4%
[███████████████████░░░░░░░░░░░░░░░░░░░░] 48.4%
════════════════════════════════════════════════════════════════

🎯 TOP TENDENCIAS CON IMÁGENES
════════════════════════════════════════════════════════════════

🚀 1. "sueter tejido" [EMERGENTE]
   Interés: 100/100
   Imágenes encontradas: 5
   📸 Productos:
      1. Suéter tejido oversized - Negro
         💰 $899.00 | 🏪 Zara
      ...
```

## 🔐 Seguridad

- ✅ Nunca commities `SERPAPI_KEY` al repositorio
- ✅ Usa variables de entorno en Coolify
- ✅ MongoDB debe estar protegido con autenticación
- ✅ Considera usar MongoDB Atlas o un servidor privado

## 📚 Referencias

- [SerpAPI Documentation](https://serpapi.com/google-trends-api)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Coolify Documentation](https://coolify.io/docs)
