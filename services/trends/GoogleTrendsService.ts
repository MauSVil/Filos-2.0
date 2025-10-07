// @ts-ignore - No hay types disponibles para google-trends-api
import googleTrends from 'google-trends-api';
import { GoogleTrendsData, GoogleTrendKeyword, SWEATER_KEYWORDS } from '@/types/v2/Trend.type';

export class GoogleTrendsService {
  private static readonly GEO = 'MX'; // México
  private static readonly CATEGORY = 0; // 0 = All categories

  /**
   * Obtiene datos de tendencias para keywords de suéteres
   */
  static async getTrendsData(): Promise<GoogleTrendsData> {
    try {
      const keywords = await this.getInterestOverTime();
      const relatedQueries = await this.getRelatedQueries();

      // Si todos los keywords tienen valor 0, probablemente Google Trends está bloqueado
      const allZero = keywords.every(k => k.value === 0);

      if (allZero && keywords.length > 0) {
        console.warn('Google Trends returned all zeros - likely rate limited. Using fallback data.');
        return {
          keywords: [], // Retornar vacío para activar fallback
          relatedQueries: [],
          timestamp: new Date(),
        };
      }

      return {
        keywords,
        relatedQueries,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error fetching Google Trends data:', error);
      // Retornar datos vacíos en lugar de error para activar fallback
      return {
        keywords: [],
        relatedQueries: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Obtiene el interés a lo largo del tiempo para los keywords
   */
  private static async getInterestOverTime(): Promise<GoogleTrendKeyword[]> {
    const results: GoogleTrendKeyword[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Procesar solo los primeros 8 keywords para evitar rate limiting
    const limitedKeywords = SWEATER_KEYWORDS.slice(0, 8);

    // Flag para detectar rate limiting
    let isRateLimited = false;

    // Procesar keywords de 1 en 1 con delays largos
    for (let i = 0; i < limitedKeywords.length; i++) {
      // Si ya detectamos rate limiting, parar inmediatamente
      if (isRateLimited) {
        console.log(`⏭️  Skipping remaining keywords due to rate limit`);
        break;
      }

      const keyword = limitedKeywords[i];

      try {
        // Delay aleatorio entre 3-5 segundos (excepto el primero)
        if (i > 0) {
          const delay = 3000 + Math.random() * 2000;
          console.log(`Waiting ${Math.round(delay/1000)}s before next request...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`Fetching data for: ${keyword}`);
        const response = await googleTrends.interestOverTime({
          keyword: keyword,
          startTime: thirtyDaysAgo,
          endTime: now,
          geo: this.GEO,
        });

        const data = JSON.parse(response);
        const timelineData = data.default?.timelineData || [];

        if (timelineData.length > 0) {
          // Calcular valor promedio
          const values = timelineData.map((point: any) => {
            const value = point.value?.[0];
            return typeof value === 'number' ? value : 0;
          });

          const avgValue = values.reduce((a: number, b: number) => a + b, 0) / values.length;

          // Calcular crecimiento (últimos 7 días vs anteriores 7 días)
          const recentValues = values.slice(-7);
          const previousValues = values.slice(-14, -7);

          const recentAvg = recentValues.reduce((a: number, b: number) => a + b, 0) / recentValues.length;
          const previousAvg = previousValues.reduce((a: number, b: number) => a + b, 0) / previousValues.length;

          const growth = previousAvg > 0
            ? ((recentAvg - previousAvg) / previousAvg) * 100
            : 0;

          results.push({
            term: keyword,
            value: Math.round(avgValue),
            growth: Math.round(growth),
          });

          console.log(`✓ ${keyword}: value=${Math.round(avgValue)}, growth=${Math.round(growth)}%`);
        }
      } catch (error) {
        // Detectar si es error de rate limiting (CAPTCHA/302)
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('Unexpected token') || errorMessage.includes('HTML')) {
          console.error(`🚫 Google Trends rate limited detected. Stopping requests.`);
          isRateLimited = true;
          break; // Parar inmediatamente
        }

        console.error(`Error processing ${keyword}:`, error);
        results.push({
          term: keyword,
          value: 0,
          growth: 0,
        });
      }
    }

    // Ordenar por valor descendente
    return results.sort((a, b) => b.value - a.value);
  }

  /**
   * Obtiene queries relacionadas para los top keywords
   */
  private static async getRelatedQueries(): Promise<string[]> {
    // Saltar related queries por ahora para evitar rate limiting
    // Retornar array vacío
    console.log('Skipping related queries to avoid rate limiting');
    return [];
  }

  /**
   * Obtiene las top 5 keywords con mayor crecimiento
   */
  static async getTopRisingKeywords(limit: number = 5): Promise<GoogleTrendKeyword[]> {
    const data = await this.getTrendsData();
    return data.keywords
      .filter(k => k.growth > 0)
      .sort((a, b) => b.growth - a.growth)
      .slice(0, limit);
  }

  /**
   * Obtiene las top 5 keywords con mayor interés
   */
  static async getTopKeywords(limit: number = 5): Promise<GoogleTrendKeyword[]> {
    const data = await this.getTrendsData();
    return data.keywords
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }
}
