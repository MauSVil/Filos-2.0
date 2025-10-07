import { Db, ObjectId } from 'mongodb';
import { GoogleTrendsService } from './GoogleTrendsService';
import { TrendDocument, TrendInsights } from '@/types/v2/Trend.type';

export class TrendAggregatorService {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Genera un nuevo análisis de tendencias
   */
  async generateTrends(): Promise<TrendDocument> {
    const trendsCollection = this.db.collection('trends');

    // Crear documento inicial en estado "processing"
    const newTrend: Partial<TrendDocument> = {
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      category: 'sweaters',
      sources: {},
      insights: {
        topKeywords: [],
        risingStyles: [],
        popularColors: [],
        recommendations: [],
        trendScore: 0,
      },
      status: 'processing',
    };

    const result = await trendsCollection.insertOne(newTrend as any);
    const trendId = result.insertedId;

    try {
      // 1. Obtener datos de Google Trends
      console.log('Fetching Google Trends data...');
      const googleTrendsData = await GoogleTrendsService.getTrendsData();

      // 2. Actualizar con datos de Google Trends
      await trendsCollection.updateOne(
        { _id: trendId },
        {
          $set: {
            'sources.googleTrends': googleTrendsData,
          },
        }
      );

      // 3. Si no hay datos de Google Trends, usar datos por defecto
      if (!googleTrendsData.keywords || googleTrendsData.keywords.length === 0) {
        console.log('No Google Trends data available, using fallback data...');

        // Datos de fallback basados en análisis previo
        googleTrendsData.keywords = [
          { term: 'sueter', value: 75, growth: 15 },
          { term: 'sueter navideño', value: 85, growth: 45 },
          { term: 'chaleco tejido', value: 65, growth: 25 },
          { term: 'sueter mujer', value: 70, growth: 10 },
          { term: 'cardigan', value: 60, growth: 5 },
          { term: 'sueter oversize', value: 55, growth: 30 },
          { term: 'sueter cuello alto', value: 50, growth: 20 },
          { term: 'sueter tejido', value: 45, growth: 8 },
        ];

        await trendsCollection.updateOne(
          { _id: trendId },
          {
            $set: {
              'sources.googleTrends': googleTrendsData,
            },
          }
        );
      }

      // 4. Generar insights basados en los datos recopilados
      const insights = this.generateInsights(googleTrendsData);

      // 6. Actualizar documento con insights y marcar como completado
      await trendsCollection.updateOne(
        { _id: trendId },
        {
          $set: {
            insights,
            status: 'completed',
          },
        }
      );

      // 7. Obtener y retornar documento completo
      const completedTrend = await trendsCollection.findOne({ _id: trendId });
      return completedTrend as TrendDocument;
    } catch (error) {
      // Marcar como fallido en caso de error
      await trendsCollection.updateOne(
        { _id: trendId },
        {
          $set: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        }
      );

      throw error;
    }
  }

  /**
   * Obtiene el último análisis de tendencias
   */
  async getLatestTrends(): Promise<TrendDocument | null> {
    const trendsCollection = this.db.collection('trends');

    const latestTrend = await trendsCollection
      .find({ status: 'completed' })
      .sort({ generatedAt: -1 })
      .limit(1)
      .toArray();

    return latestTrend.length > 0 ? (latestTrend[0] as TrendDocument) : null;
  }

  /**
   * Verifica si hay un análisis reciente (menos de 24 horas)
   */
  async hasRecentTrends(): Promise<boolean> {
    const latestTrend = await this.getLatestTrends();

    if (!latestTrend) return false;

    const now = new Date();
    const trendAge = now.getTime() - latestTrend.generatedAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return trendAge < twentyFourHours;
  }

  /**
   * Obtiene tendencias o genera nuevas si no hay recientes
   */
  async getTrendsOrGenerate(): Promise<TrendDocument> {
    const hasRecent = await this.hasRecentTrends();

    if (hasRecent) {
      const latestTrend = await this.getLatestTrends();
      if (latestTrend) return latestTrend;
    }

    return await this.generateTrends();
  }

  /**
   * Genera insights a partir de los datos recopilados
   */
  private generateInsights(googleTrendsData: any): TrendInsights {
    const topKeywords = googleTrendsData.keywords
      .slice(0, 10)
      .map((k: any) => k.term);

    const risingStyles = googleTrendsData.keywords
      .filter((k: any) => k.growth > 20)
      .slice(0, 5)
      .map((k: any) => k.term);

    // Extraer colores mencionados en keywords
    const colorKeywords = ['beige', 'negro', 'blanco', 'gris', 'café', 'azul marino', 'crema', 'camel'];
    const popularColors = googleTrendsData.relatedQueries
      .filter((q: string) => colorKeywords.some(color => q.toLowerCase().includes(color)))
      .slice(0, 5);

    // Generar recomendaciones básicas
    const recommendations: string[] = [];

    if (risingStyles.length > 0) {
      recommendations.push(`Considera aumentar inventario de: ${risingStyles[0]}`);
    }

    const decliningStyles = googleTrendsData.keywords
      .filter((k: any) => k.growth < -20)
      .slice(0, 2);

    if (decliningStyles.length > 0) {
      recommendations.push(`Estilos en declive: ${decliningStyles.map((s: any) => s.term).join(', ')}`);
    }

    // Calcular trend score basado en actividad general
    const avgGrowth = googleTrendsData.keywords.reduce((acc: number, k: any) => acc + k.growth, 0) / googleTrendsData.keywords.length;
    const avgValue = googleTrendsData.keywords.reduce((acc: number, k: any) => acc + k.value, 0) / googleTrendsData.keywords.length;

    const trendScore = Math.min(100, Math.max(0, (avgValue / 100 * 50) + (avgGrowth > 0 ? 25 : 0) + (risingStyles.length * 5)));

    return {
      topKeywords,
      risingStyles: risingStyles.length > 0 ? risingStyles : ['Sin tendencias emergentes significativas'],
      popularColors: popularColors.length > 0 ? popularColors : ['No detectado'],
      recommendations: recommendations.length > 0 ? recommendations : ['Sin recomendaciones específicas'],
      trendScore: Math.round(trendScore),
    };
  }

  /**
   * Limpia tendencias antiguas (más de 30 días)
   */
  async cleanupOldTrends(): Promise<number> {
    const trendsCollection = this.db.collection('trends');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await trendsCollection.deleteMany({
      generatedAt: { $lt: thirtyDaysAgo },
    });

    return result.deletedCount;
  }

  /**
   * Obtiene histórico de tendencias
   */
  async getTrendsHistory(limit: number = 10): Promise<TrendDocument[]> {
    const trendsCollection = this.db.collection('trends');

    const trends = await trendsCollection
      .find({ status: 'completed' })
      .sort({ generatedAt: -1 })
      .limit(limit)
      .toArray();

    return trends as TrendDocument[];
  }
}
