import { SerperImage } from '@/types/v2/TrendImage.type';

interface SerperImageSearchResponse {
  images?: Array<{
    title: string;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    thumbnailUrl?: string;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    source?: string;
    domain?: string;
    link?: string;
    position?: number;
  }>;
}

export class SerperImageService {
  private static readonly API_KEY = process.env.SERPER_API_KEY;
  private static readonly API_URL = 'https://google.serper.dev/images';

  /**
   * Busca imágenes usando Serper API (Google Images)
   */
  static async searchImages(query: string, count: number = 9): Promise<SerperImage[]> {
    if (!this.API_KEY) {
      throw new Error('SERPER_API_KEY not configured');
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `${query} sueter moda tendencia`, // Optimizado para suéteres en español
          num: count,
          gl: 'mx', // Región: México
          hl: 'es', // Idioma: Español
          tbs: 'qdr:m', // Filtro: último mes (imágenes recientes)
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data: SerperImageSearchResponse = await response.json();

      if (!data.images || data.images.length === 0) {
        console.warn(`No images found for query: ${query}`);
        return [];
      }

      // Mapear y validar resultados
      return data.images.map((image) => ({
        title: image.title,
        imageUrl: image.imageUrl,
        imageWidth: image.imageWidth,
        imageHeight: image.imageHeight,
        thumbnailUrl: image.thumbnailUrl,
        thumbnailWidth: image.thumbnailWidth,
        thumbnailHeight: image.thumbnailHeight,
        source: image.source,
        domain: image.domain,
        link: image.link,
        position: image.position,
      }));
    } catch (error) {
      console.error('Error fetching images from Serper:', error);
      throw error;
    }
  }

  /**
   * Busca imágenes para múltiples keywords
   */
  static async searchMultipleKeywords(
    keywords: string[],
    imagesPerKeyword: number = 6
  ): Promise<Record<string, SerperImage[]>> {
    const results: Record<string, SerperImage[]> = {};

    // Procesar en secuencia para evitar rate limiting
    for (const keyword of keywords) {
      try {
        const images = await this.searchImages(keyword, imagesPerKeyword);
        results[keyword] = images;

        // Rate limiting: esperar 1 segundo entre requests
        if (keywords.indexOf(keyword) < keywords.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error fetching images for keyword "${keyword}":`, error);
        results[keyword] = [];
      }
    }

    return results;
  }
}
