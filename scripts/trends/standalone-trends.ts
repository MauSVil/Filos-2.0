#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 SCRIPT STANDALONE - ANÁLISIS DE TENDENCIAS DE SUÉTERES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este script es COMPLETAMENTE AUTOCONTENIDO y puede ejecutarse desde
 * cualquier cronjob sin dependencias externas de archivos del proyecto.
 *
 * Requisitos:
 * - Node.js v18+ o Bun runtime
 * - Variable de entorno SERPAPI_KEY (requerida)
 * - Variable de entorno MONGODB_URI (requerida)
 * - Variables opcionales: MAX_TERMS_FOR_IMAGES, MAX_IMAGES_PER_TERM, DRY_RUN
 *
 * Uso:
 * npx tsx scripts/trends/standalone-trends.ts
 *
 * Con parámetros personalizados:
 * MAX_TERMS_FOR_IMAGES=20 MAX_IMAGES_PER_TERM=5 npx tsx scripts/trends/standalone-trends.ts
 *
 * Modo de prueba (NO gasta búsquedas):
 * DRY_RUN=true npx tsx scripts/trends/standalone-trends.ts
 *
 * Output:
 * - Resultados de tendencias: MongoDB colección 'trends_results'
 * - Tracking de uso: MongoDB colección 'serpapi_usage'
 * - Ambos persisten entre deploys y reinicios del servidor
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getJson } from 'serpapi';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// ═════════════════════════════════════════════════════════════════════════════
// INTERFACES Y TIPOS
// ═════════════════════════════════════════════════════════════════════════════

interface UsageStats {
  totalSearches: number;
  monthlyLimit: number;
  currentMonth: string;
  searches: Array<{
    timestamp: string;
    term: string;
    success: boolean;
  }>;
  lastReset: string;
}

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

interface ImageSearchResult {
  query: string;
  images: ProductImage[];
  totalFound: number;
  timestamp: Date;
}

interface RelatedQuery {
  query: string;
  value: number;
  type: 'top' | 'rising';
  growth?: string;
  images?: ProductImage[];
}

interface TrendingSearch {
  query: string;
  searchVolume: string;
  articles?: Array<{
    title: string;
    source: string;
  }>;
}

// ═════════════════════════════════════════════════════════════════════════════
// SERPAPI USAGE TRACKER - MONGODB VERSION
// ═════════════════════════════════════════════════════════════════════════════

class SerpAPIUsageTracker {
  private stats: UsageStats | null = null;
  private mongoClient: MongoClient | null = null;
  private readonly collectionName = 'serpapi_usage';
  private readonly dbName = 'test';

  async initialize(): Promise<void> {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurado en variables de entorno');
    }

    this.mongoClient = new MongoClient(mongoUri);
    await this.mongoClient.connect();

    // Cargar o crear stats
    await this.loadStats();
    await this.checkAndResetIfNewMonth();
  }

  private async loadStats(): Promise<void> {
    try {
      const db = this.mongoClient!.db(this.dbName);
      const collection = db.collection(this.collectionName);

      const doc = await collection.findOne({ type: 'usage_tracker' });

      if (doc) {
        this.stats = {
          totalSearches: doc.totalSearches,
          monthlyLimit: doc.monthlyLimit,
          currentMonth: doc.currentMonth,
          searches: doc.searches || [],
          lastReset: doc.lastReset
        };
      } else {
        await this.resetStats();
      }
    } catch (error) {
      console.error('Error cargando stats desde MongoDB, creando nuevas:', error);
      await this.resetStats();
    }
  }

  private async saveStats(): Promise<void> {
    if (!this.stats) {
      await this.resetStats();
      return;
    }

    const db = this.mongoClient!.db(this.dbName);
    const collection = db.collection(this.collectionName);

    await collection.updateOne(
      { type: 'usage_tracker' },
      {
        $set: {
          type: 'usage_tracker',
          totalSearches: this.stats.totalSearches,
          monthlyLimit: this.stats.monthlyLimit,
          currentMonth: this.stats.currentMonth,
          searches: this.stats.searches,
          lastReset: this.stats.lastReset,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );
  }

  private async resetStats(): Promise<void> {
    const now = new Date();
    this.stats = {
      totalSearches: 0,
      monthlyLimit: 250,
      currentMonth: this.getCurrentMonth(),
      searches: [],
      lastReset: now.toISOString()
    };
    await this.saveStats();
  }

  private async checkAndResetIfNewMonth(): Promise<void> {
    const currentMonth = this.getCurrentMonth();

    if (this.stats && this.stats.currentMonth !== currentMonth) {
      console.log(`📅 Nuevo mes detectado (${currentMonth}), reseteando contador...`);
      await this.resetStats();
    }
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  canMakeSearch(count: number = 1): boolean {
    if (!this.stats) {
      return false;
    }

    const remaining = this.getRemainingSearches();
    return remaining >= count;
  }

  getRemainingSearches(): number {
    if (!this.stats) {
      return 0;
    }

    return Math.max(0, this.stats.monthlyLimit - this.stats.totalSearches);
  }

  async recordSearch(term: string, success: boolean = true): Promise<void> {
    if (!this.stats) {
      await this.initialize();
    }

    this.stats!.totalSearches++;
    this.stats!.searches.push({
      timestamp: new Date().toISOString(),
      term,
      success
    });

    await this.saveStats();
  }

  async validateCanProceed(searchCount: number): Promise<void> {
    await this.initialize();

    if (!this.canMakeSearch(searchCount)) {
      const remaining = this.getRemainingSearches();

      throw new Error(
        `❌ Límite de SerpAPI excedido.\n` +
        `   Búsquedas requeridas: ${searchCount}\n` +
        `   Búsquedas disponibles: ${remaining}\n` +
        `   Límite mensual: ${this.stats?.monthlyLimit}\n` +
        `   Mes actual: ${this.stats?.currentMonth}\n\n` +
        `   El contador se reseteará el próximo mes.`
      );
    }
  }

  printUsageReport(): void {
    if (!this.stats) {
      console.log('⚠️  No hay datos de uso disponibles');
      return;
    }

    const remaining = this.getRemainingSearches();
    const percentage = (this.stats.totalSearches / this.stats.monthlyLimit) * 100;

    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE USO DE SERPAPI');
    console.log('='.repeat(60));
    console.log(`Mes actual: ${this.stats.currentMonth}`);
    console.log(`Límite mensual: ${this.stats.monthlyLimit} búsquedas`);
    console.log(`Búsquedas realizadas: ${this.stats.totalSearches}`);
    console.log(`Búsquedas restantes: ${remaining}`);
    console.log(`Uso: ${percentage.toFixed(1)}%`);

    const barLength = 40;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`[${bar}] ${percentage.toFixed(1)}%`);

    if (remaining < 50) {
      console.log('\n⚠️  ADVERTENCIA: Quedan menos de 50 búsquedas');
    }

    if (remaining === 0) {
      console.log('\n🚫 LÍMITE ALCANZADO: No se pueden hacer más búsquedas este mes');
    }

    console.log('='.repeat(60) + '\n');
  }

  async disconnect(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }

  getMongoClient(): MongoClient | null {
    return this.mongoClient;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PRODUCT IMAGE SEARCH SERVICE
// ═════════════════════════════════════════════════════════════════════════════

class ProductImageSearchService {
  private readonly apiKey: string;
  private readonly usageTracker: SerpAPIUsageTracker;

  constructor(apiKey: string, usageTracker: SerpAPIUsageTracker) {
    this.apiKey = apiKey;
    this.usageTracker = usageTracker;

    if (!this.apiKey) {
      console.warn('⚠️  SERPAPI_KEY no configurado');
    }
  }

  async searchProductImages(
    query: string,
    maxImages: number = 5
  ): Promise<ImageSearchResult> {
    if (!this.apiKey) {
      throw new Error('SerpAPI key requerida');
    }

    await this.usageTracker.initialize();
    await this.usageTracker.validateCanProceed(1);

    try {
      console.log(`  🖼️  Buscando imágenes: "${query}"...`);

      const response = await getJson({
        engine: 'google_shopping',
        q: query,
        location: 'Mexico',
        google_domain: 'google.com.mx',
        gl: 'mx',
        hl: 'es',
        api_key: this.apiKey,
        num: Math.min(maxImages, 20)
      });

      await this.usageTracker.recordSearch(`images:${query}`, true);

      const shoppingResults = response.shopping_results || [];

      const images: ProductImage[] = shoppingResults
        .slice(0, maxImages)
        .map((result: any, index: number) => ({
          url: result.link || result.product_link || '',
          thumbnail: result.thumbnail || result.image || '',
          title: result.title || '',
          source: result.source || 'Unknown',
          price: result.price || result.extracted_price?.toString(),
          shop: result.source || result.store || undefined,
          rating: result.rating ? parseFloat(result.rating) : undefined,
          reviews: result.reviews ? parseInt(result.reviews) : undefined,
          position: index + 1
        }))
        .filter((img: ProductImage) => img.thumbnail && img.url);

      console.log(`    ✓ Encontradas ${images.length} imágenes`);

      return {
        query,
        images,
        totalFound: shoppingResults.length,
        timestamp: new Date()
      };

    } catch (error: any) {
      await this.usageTracker.recordSearch(`images:${query}`, false);
      console.error(`    ✗ Error buscando imágenes para "${query}":`, error.message);

      return {
        query,
        images: [],
        totalFound: 0,
        timestamp: new Date()
      };
    }
  }

  async searchMultipleTerms(
    terms: string[],
    imagesPerTerm: number = 5,
    delayBetweenSearches: number = 1000
  ): Promise<Map<string, ImageSearchResult>> {
    await this.usageTracker.initialize();
    await this.usageTracker.validateCanProceed(terms.length);

    const results = new Map<string, ImageSearchResult>();
    const remaining = this.usageTracker.getRemainingSearches();

    console.log(`\n🖼️  Buscando imágenes para ${terms.length} términos (Restantes: ${remaining})\n`);

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];

      console.log(`[${i + 1}/${terms.length}]`);

      const result = await this.searchProductImages(term, imagesPerTerm);
      results.set(term, result);

      if (i < terms.length - 1) {
        await this.sleep(delayBetweenSearches);
      }
    }

    console.log(`\n✅ Búsqueda de imágenes completada\n`);
    this.usageTracker.printUsageReport();

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// TREND DISCOVERY SERVICE
// ═════════════════════════════════════════════════════════════════════════════

class TrendDiscoveryService {
  private readonly apiKey: string;
  private readonly geo: string = 'MX';
  private readonly usageTracker: SerpAPIUsageTracker;
  private readonly imageSearchService: ProductImageSearchService;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.usageTracker = new SerpAPIUsageTracker();
    this.imageSearchService = new ProductImageSearchService(this.apiKey, this.usageTracker);
  }

  async discoverTrendingSweaters(): Promise<{
    trendingSearches: TrendingSearch[];
    relatedQueries: {
      top: RelatedQuery[];
      rising: RelatedQuery[];
    };
  }> {
    await this.usageTracker.initialize();

    console.log(`🔍 Buscando tendencias actuales en suéteres tejidos...\n`);

    const trending = await this.getTrendingSearches();

    const searchTerms = [
      'suéter tejido',
      'suéter invierno',
      'cardigan tejido',
      'suéter oversized',
      'suéter cuello alto',
      'cardigan largo',
      'suéter negro',
      'suéter beige',
      'suéter mujer invierno'
    ];

    const allRelatedQueries: { top: RelatedQuery[]; rising: RelatedQuery[] } = {
      top: [],
      rising: []
    };

    for (const term of searchTerms) {
      const related = await this.getRelatedQueries(term);
      allRelatedQueries.top.push(...related.top);
      allRelatedQueries.rising.push(...related.rising);
    }

    const uniqueTop = this.deduplicateQueries(allRelatedQueries.top);
    const uniqueRising = this.deduplicateQueries(allRelatedQueries.rising);

    return {
      trendingSearches: trending,
      relatedQueries: {
        top: uniqueTop,
        rising: uniqueRising
      }
    };
  }

  private deduplicateQueries(queries: RelatedQuery[]): RelatedQuery[] {
    const queryMap = new Map<string, RelatedQuery>();

    for (const query of queries) {
      const key = query.query.toLowerCase().trim();
      const existing = queryMap.get(key);

      if (!existing || query.value > existing.value) {
        queryMap.set(key, query);
      }
    }

    return Array.from(queryMap.values())
      .sort((a, b) => b.value - a.value);
  }

  private filterNonActionableQueries(queries: RelatedQuery[]): RelatedQuery[] {
    const blacklist = [
      'zara', 'h&m', 'pull&bear', 'bershka', 'mango', 'shein', 'forever 21',
      'club misterio', 'alo', 'moncler', 'ralph lauren', 'tommy', 'nike',
      'taylor swift', 'tatuaje', 'silvia pinal', 'weezer',
      'showgirl', 'mextilo', 'canción', 'song', 'película', 'serie',
      'ugly', 'aesthetic'
    ];

    return queries.filter(query => {
      const queryLower = query.query.toLowerCase();

      const hasBlacklistedTerm = blacklist.some(term => queryLower.includes(term));
      if (hasBlacklistedTerm) return false;

      if (queryLower.includes('#') || queryLower.includes('@')) return false;

      const productTerms = [
        'suéter', 'sueter', 'sweater', 'cardigan', 'jersey', 'pullover',
        'tejido', 'lana', 'algodón', 'punto', 'crochet',
        'negro', 'blanco', 'beige', 'café', 'verde', 'azul', 'gris', 'rosa', 'morado', 'rojo',
        'oversized', 'largo', 'corto', 'crop', 'cuello alto', 'cuello v', 'sin mangas',
        'mujer', 'hombre', 'niño', 'niña',
        'invierno', 'otoño'
      ];

      const hasProductTerm = productTerms.some(term => queryLower.includes(term));

      return hasProductTerm;
    });
  }

  async getTrendingSearches(): Promise<TrendingSearch[]> {
    if (!this.apiKey) {
      throw new Error('SerpAPI key requerida');
    }

    await this.usageTracker.validateCanProceed(1);

    try {
      console.log('  📈 Obteniendo trending searches...');

      const response = await getJson({
        engine: 'google_trends_trending_now',
        geo: this.geo,
        api_key: this.apiKey
      });

      await this.usageTracker.recordSearch('trending_searches', true);

      const allTrending = response.trending_searches || [];
      const fashionRelated = allTrending.filter((item: any) => {
        const query = item.query?.toLowerCase() || '';
        return query.includes('suéter') ||
               query.includes('sweater') ||
               query.includes('cardigan') ||
               query.includes('ropa') ||
               query.includes('moda') ||
               query.includes('chamarra') ||
               query.includes('abrigo');
      });

      return fashionRelated.map((item: any) => ({
        query: item.query,
        searchVolume: item.search_volume || 'N/A',
        articles: item.articles?.slice(0, 3).map((a: any) => ({
          title: a.title,
          source: a.source
        }))
      }));

    } catch (error: any) {
      await this.usageTracker.recordSearch('trending_searches', false);
      console.error('  ✗ Error obteniendo trending searches:', error.message);
      return [];
    }
  }

  async getRelatedQueries(keyword: string): Promise<{ top: RelatedQuery[]; rising: RelatedQuery[] }> {
    if (!this.apiKey) {
      throw new Error('SerpAPI key requerida');
    }

    await this.usageTracker.validateCanProceed(1);

    try {
      console.log(`  🔗 Obteniendo búsquedas relacionadas a "${keyword}"...`);

      const response = await getJson({
        engine: 'google_trends',
        q: keyword,
        data_type: 'RELATED_QUERIES',
        geo: this.geo,
        api_key: this.apiKey
      });

      await this.usageTracker.recordSearch(`related:${keyword}`, true);

      const topQueries = response.related_queries?.top || [];
      const risingQueries = response.related_queries?.rising || [];

      return {
        top: topQueries.map((q: any) => ({
          query: q.query,
          value: parseInt(q.value) || 0,
          type: 'top' as const
        })),
        rising: risingQueries.map((q: any) => ({
          query: q.query,
          value: parseInt(q.value) || 0,
          type: 'rising' as const,
          growth: q.extracted_value
        }))
      };

    } catch (error: any) {
      await this.usageTracker.recordSearch(`related:${keyword}`, false);
      console.error(`  ✗ Error obteniendo related queries:`, error.message);
      return { top: [], rising: [] };
    }
  }

  async discoverProductOpportunities() {
    const result = await this.discoverTrendingSweaters();

    const actionableRising = this.filterNonActionableQueries(result.relatedQueries.rising);
    const actionableTop = this.filterNonActionableQueries(result.relatedQueries.top);

    console.log(`\n🔍 Filtrado de resultados:`);
    console.log(`   Rising: ${result.relatedQueries.rising.length} → ${actionableRising.length} accionables`);
    console.log(`   Top: ${result.relatedQueries.top.length} → ${actionableTop.length} accionables\n`);

    const emergingTrends = actionableRising
      .filter(q => q.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

    const topDemand = actionableTop
      .filter(q => q.value > 20)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

    return {
      emergingTrends,
      topDemand,
      trendingSearches: result.trendingSearches
    };
  }

  async discoverProductOpportunitiesWithImages(options?: {
    maxTermsForImages?: number;
    imagesPerTerm?: number;
  }) {
    const maxTermsForImages = options?.maxTermsForImages || 20;
    const imagesPerTerm = options?.imagesPerTerm || 5;

    console.log('\n' + '='.repeat(80));
    console.log('🔍 DESCUBRIMIENTO DE TENDENCIAS CON IMÁGENES');
    console.log('='.repeat(80));
    console.log(`Estrategia: Top ${maxTermsForImages} términos × ${imagesPerTerm} imágenes = ${maxTermsForImages * imagesPerTerm} búsquedas de imágenes`);
    console.log('='.repeat(80) + '\n');

    console.log('📊 PASO 1: Descubriendo tendencias...\n');
    const opportunities = await this.discoverProductOpportunities();

    console.log('\n📋 PASO 2: Seleccionando términos más valiosos...\n');

    const allTerms = [
      ...opportunities.emergingTrends.map(t => ({ ...t, priority: 'emerging' as const })),
      ...opportunities.topDemand.map(t => ({ ...t, priority: 'top' as const }))
    ];

    const selectedTerms = allTerms
      .sort((a, b) => b.value - a.value)
      .slice(0, maxTermsForImages);

    console.log(`✓ Seleccionados ${selectedTerms.length} términos para búsqueda de imágenes:`);
    selectedTerms.forEach((term, i) => {
      const emoji = term.priority === 'emerging' ? '🚀' : '📊';
      console.log(`  ${emoji} ${i + 1}. "${term.query}" (${term.value})`);
    });

    console.log('\n🖼️  PASO 3: Buscando imágenes de productos...');

    const imageResults = await this.imageSearchService.searchMultipleTerms(
      selectedTerms.map(t => t.query),
      imagesPerTerm,
      1000
    );

    const topTermsWithImages = selectedTerms.map(term => {
      const imageResult = imageResults.get(term.query);
      return {
        query: term.query,
        value: term.value,
        type: term.type,
        growth: term.growth,
        images: imageResult?.images || []
      };
    });

    const totalImagesFound = topTermsWithImages.reduce((sum, t) => sum + t.images.length, 0);
    const termsWithImages = topTermsWithImages.filter(t => t.images.length > 0).length;
    const termsWithoutImages = topTermsWithImages.filter(t => t.images.length === 0).length;

    console.log('\n' + '='.repeat(80));
    console.log('📸 ESTADÍSTICAS DE IMÁGENES');
    console.log('='.repeat(80));
    console.log(`Términos analizados: ${selectedTerms.length}`);
    console.log(`Términos con imágenes: ${termsWithImages}`);
    console.log(`Términos sin imágenes: ${termsWithoutImages}`);
    console.log(`Total de imágenes encontradas: ${totalImagesFound}`);
    console.log(`Promedio por término: ${(totalImagesFound / selectedTerms.length).toFixed(1)}`);
    console.log('='.repeat(80) + '\n');

    return {
      category: 'suéteres',
      trendingSearches: opportunities.trendingSearches,
      relatedQueries: {
        top: opportunities.topDemand,
        rising: opportunities.emergingTrends
      },
      topTermsWithImages,
      imageStats: {
        totalTermsSearched: selectedTerms.length,
        totalImagesFound,
        termsWithImages,
        termsWithoutImages
      },
      timestamp: new Date()
    };
  }

  getUsageTracker(): SerpAPIUsageTracker {
    return this.usageTracker;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 ANÁLISIS DE TENDENCIAS DE SUÉTERES - MÉXICO');
  console.log('═'.repeat(80));
  console.log('Script standalone - Genera JSON con tendencias e imágenes');
  console.log('═'.repeat(80) + '\n');

  // 🔒 DRY RUN MODE: No hace búsquedas reales, solo muestra configuración
  const dryRun = process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1';

  if (dryRun) {
    console.log('🧪 MODO DRY RUN ACTIVADO - No se realizarán búsquedas reales\n');
    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   API Key: ${process.env.SERPAPI_KEY ? '✓ Configurada' : '✗ No configurada'}`);
    console.log(`   Términos a analizar: ${process.env.MAX_TERMS_FOR_IMAGES || '20'}`);
    console.log(`   Imágenes por término: ${process.env.MAX_IMAGES_PER_TERM || '5'}`);
    console.log(`   Total búsquedas estimadas: ~${parseInt(process.env.MAX_TERMS_FOR_IMAGES || '20') * parseInt(process.env.MAX_IMAGES_PER_TERM || '5') + 10}`);
    console.log('\n✅ DRY RUN completado - Para ejecutar realmente, quita DRY_RUN=true\n');
    console.log('═'.repeat(80) + '\n');
    return;
  }

  // Validar API key
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('❌ Error: SERPAPI_KEY no está configurado');
    console.error('\n💡 Uso: SERPAPI_KEY=xxx node standalone-trends.js\n');
    console.error('💡 Para pruebas sin gastar búsquedas: DRY_RUN=true node standalone-trends.js\n');
    process.exit(1);
  }

  const discoveryService = new TrendDiscoveryService(apiKey);

  try {
    // Configuración desde variables de entorno
    const maxTermsForImages = parseInt(process.env.MAX_TERMS_FOR_IMAGES || '20');
    const imagesPerTerm = parseInt(process.env.MAX_IMAGES_PER_TERM || '5');

    console.log('⚙️  CONFIGURACIÓN:');
    console.log(`   Términos a analizar: ${maxTermsForImages}`);
    console.log(`   Imágenes por término: ${imagesPerTerm}`);
    console.log(`   Total búsquedas estimadas: ~${maxTermsForImages * imagesPerTerm + 10}`);
    console.log('');

    // PASO 1: Descubrir tendencias con imágenes
    const result = await discoveryService.discoverProductOpportunitiesWithImages({
      maxTermsForImages,
      imagesPerTerm
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const allImages = result.topTermsWithImages.flatMap(t => t.images);

    // PASO 2: Mostrar resultados en consola
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 TOP TENDENCIAS CON IMÁGENES');
    console.log('═'.repeat(80) + '\n');

    result.topTermsWithImages.forEach((term, index) => {
      const emoji = term.type === 'rising' ? '🚀' : '📊';
      const typeLabel = term.type === 'rising' ? 'EMERGENTE' : 'ALTA DEMANDA';

      console.log(`${emoji} ${index + 1}. "${term.query}" [${typeLabel}]`);
      console.log(`   Interés: ${term.value}/100 ${term.growth ? `(${term.growth})` : ''}`);
      console.log(`   Imágenes encontradas: ${term.images.length}`);

      if (term.images.length > 0) {
        console.log('   📸 Productos:');
        term.images.slice(0, 3).forEach((img, i) => {
          console.log(`      ${i + 1}. ${img.title.slice(0, 60)}...`);
          console.log(`         💰 ${img.price || 'Sin precio'} | 🏪 ${img.shop}`);
        });

        if (term.images.length > 3) {
          console.log(`      ... y ${term.images.length - 3} más`);
        }
      }
      console.log('');
    });

    // PASO 3: Análisis de productos
    console.log('═'.repeat(80));
    console.log('🎨 ANÁLISIS DE PRODUCTOS');
    console.log('═'.repeat(80) + '\n');

    // Analizar colores
    const colors = ['negro', 'negra', 'blanco', 'blanca', 'beige', 'café', 'verde', 'azul', 'gris', 'rosa', 'morado', 'rojo'];
    const colorCounts = colors.map(color => {
      const count = allImages.filter(img => img.title.toLowerCase().includes(color)).length;
      return { color, count };
    }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    console.log('🎨 COLORES MÁS VISTOS:\n');
    colorCounts.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.color.toUpperCase()}: ${c.count} productos`);
    });

    // Analizar tiendas
    const shopCounts = new Map<string, number>();
    allImages.forEach(img => {
      const shop = img.shop || img.source || 'Desconocida';
      shopCounts.set(shop, (shopCounts.get(shop) || 0) + 1);
    });
    const topShops = Array.from(shopCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

    console.log('\n🏪 TIENDAS MÁS COMUNES:\n');
    topShops.forEach((shop, i) => {
      console.log(`  ${i + 1}. ${shop[0]}: ${shop[1]} productos`);
    });

    // Analizar precios
    const pricesWithCurrency = allImages
      .filter(img => img.price)
      .map(img => {
        const match = img.price!.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(',', '')) : null;
      })
      .filter(p => p !== null && !isNaN(p)) as number[];

    console.log('\n💰 ANÁLISIS DE PRECIOS:\n');
    if (pricesWithCurrency.length > 0) {
      const minPrice = Math.min(...pricesWithCurrency);
      const maxPrice = Math.max(...pricesWithCurrency);
      const avgPrice = pricesWithCurrency.reduce((a, b) => a + b, 0) / pricesWithCurrency.length;

      console.log(`  Productos con precio: ${pricesWithCurrency.length}/${allImages.length}`);
      console.log(`  Precio mínimo: $${minPrice.toFixed(2)}`);
      console.log(`  Precio máximo: $${maxPrice.toFixed(2)}`);
      console.log(`  Precio promedio: $${avgPrice.toFixed(2)}`);
    }

    // PASO 4: Guardar resultados en MongoDB
    console.log('\n═'.repeat(80));
    console.log('💾 GUARDANDO RESULTADOS EN MONGODB');
    console.log('═'.repeat(80) + '\n');

    const tracker = discoveryService.getUsageTracker();
    const mongoClient = tracker.getMongoClient();

    if (!mongoClient) {
      console.error('❌ Error: No hay conexión a MongoDB disponible');
      throw new Error('MongoDB client not initialized');
    }

    const db = mongoClient.db('test');
    const trendsCollection = db.collection('trends_results');

    const trendDocument = {
      date: dateStr,
      timestamp: new Date().toISOString(),
      category: result.category,
      topTermsWithImages: result.topTermsWithImages,
      imageStats: result.imageStats,
      trendingSearches: result.trendingSearches,
      relatedQueries: result.relatedQueries,
      metadata: {
        searchesUsed: result.topTermsWithImages.length + 10, // Estimado
        generatedAt: new Date()
      }
    };

    const insertResult = await trendsCollection.updateOne(
      { date: dateStr },
      { $set: trendDocument },
      { upsert: true }
    );

    if (insertResult.upsertedCount > 0) {
      console.log(`   ✅ Resultados guardados en MongoDB (nuevo documento)`);
    } else if (insertResult.modifiedCount > 0) {
      console.log(`   ✅ Resultados actualizados en MongoDB`);
    } else {
      console.log(`   ℹ️  Sin cambios en MongoDB (datos idénticos)`);
    }

    console.log(`   📊 Documento: { date: "${dateStr}" }`);
    console.log(`   📁 Colección: test.trends_results`)

    // PASO 5: Reporte de uso
    console.log('');
    tracker.printUsageReport();

    // PASO 6: Resumen final
    console.log('═'.repeat(80));
    console.log('✅ ANÁLISIS COMPLETADO');
    console.log('═'.repeat(80));
    console.log(`\n💾 Resultados guardados en MongoDB:`);
    console.log(`   • Colección: test.trends_results`);
    console.log(`   • Fecha: ${dateStr}`);
    console.log(`   • Términos analizados: ${result.topTermsWithImages.length}`);
    console.log(`   • Imágenes totales: ${result.imageStats.totalImagesFound}`);
    console.log('\n' + '═'.repeat(80) + '\n');

    // Cerrar conexión a MongoDB
    await tracker.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Verifica SERPAPI_KEY, MONGODB_URI y límites de búsqueda\n');

    // Intentar cerrar la conexión incluso si hubo error
    try {
      const tracker = discoveryService.getUsageTracker();
      await tracker.disconnect();
    } catch (e) {
      // Ignorar errores al cerrar
    }

    process.exit(1);
  }
}

// Ejecutar script
main();
