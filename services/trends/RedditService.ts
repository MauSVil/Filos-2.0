import { RedditData, RedditPost } from '@/types/v2/Trend.type';

export class RedditService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  // Mapeo de keywords español -> inglés para búsqueda en Reddit
  private static readonly KEYWORD_TRANSLATION: Record<string, string> = {
    'sueter': 'sweater',
    'suéter': 'sweater',
    'sueter mujer': 'womens sweater',
    'sueter hombre': 'mens sweater',
    'sueter navideño': 'christmas sweater',
    'sueter lana': 'wool sweater',
    'sueter tejido': 'knit sweater',
    'sueter oversize': 'oversized sweater',
    'sueter cuello alto': 'turtleneck sweater',
    'sueter cuello tortuga': 'turtleneck',
    'sueter crop': 'crop sweater',
    'sueter aesthetic': 'aesthetic sweater',
    'sueter de moda': 'trendy sweater',
    'cardigan': 'cardigan',
    'cardigan mujer': 'womens cardigan',
    'chaleco tejido': 'knit vest',
  };

  /**
   * Traduce keyword de español a inglés para búsqueda en Reddit
   */
  private static translateKeyword(keyword: string): string {
    const normalized = keyword.toLowerCase().trim();
    return this.KEYWORD_TRANSLATION[normalized] || keyword;
  }

  /**
   * Obtiene un access token usando client_credentials (solo lectura)
   */
  private static async getAccessToken(): Promise<string> {
    const now = Date.now();

    // Reusar token si aún es válido
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const userAgent = process.env.REDDIT_USER_AGENT || 'FilosTrendBot/1.0';

    if (!clientId || !clientSecret) {
      throw new Error('Reddit API credentials not configured');
    }

    // Obtener token con client_credentials
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = now + (data.expires_in * 1000) - 60000; // 1 min buffer

    return this.accessToken!;
  }

  /**
   * Hace request a la API de Reddit
   */
  private static async redditRequest(endpoint: string): Promise<any> {
    const token = await this.getAccessToken();
    const userAgent = process.env.REDDIT_USER_AGENT || 'FilosTrendBot/1.0';

    const response = await fetch(`https://oauth.reddit.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Busca posts relevantes en subreddits de moda
   */
  static async searchFashionPosts(query: string, subreddits: string[] = [
    'fashion',
    'streetwear',
    'femalefashionadvice',
    'malefashionadvice',
  ]): Promise<RedditPost[]> {
    try {
      const posts: RedditPost[] = [];

      // Traducir keyword a inglés para Reddit
      const translatedQuery = this.translateKeyword(query);
      console.log(`Searching Reddit: "${query}" -> "${translatedQuery}"`);

      // Buscar en cada subreddit
      for (const subreddit of subreddits) {
        try {
          const data = await this.redditRequest(
            `/r/${subreddit}/search.json?q=${encodeURIComponent(translatedQuery)}&restrict_sr=1&t=month&sort=relevance&limit=10`
          );

          const children = data?.data?.children || [];

          for (const child of children) {
            const post = child.data;
            // Solo posts con engagement significativo
            if (post.ups > 50) {
              posts.push({
                title: post.title,
                subreddit: post.subreddit,
                upvotes: post.ups,
                url: `https://reddit.com${post.permalink}`,
                createdAt: new Date(post.created_utc * 1000),
              });
            }
          }

          // Rate limiting: esperar entre requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error searching r/${subreddit}:`, error);
          // Continuar con el siguiente subreddit
        }
      }

      // Ordenar por upvotes
      return posts.sort((a, b) => b.upvotes - a.upvotes);
    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      throw error;
    }
  }

  /**
   * Analiza posts para extraer keywords mencionados frecuentemente
   */
  static async analyzeKeywordMentions(keywords: string[]): Promise<RedditData> {
    try {
      const allPosts: RedditPost[] = [];
      const keywordMentions: string[] = [];

      // Buscar cada keyword
      for (const keyword of keywords.slice(0, 5)) {
        // Solo top 5 para no exceder rate limits
        const posts = await this.searchFashionPosts(keyword);
        allPosts.push(...posts);

        if (posts.length > 0) {
          keywordMentions.push(keyword);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Obtener top posts únicos
      const uniquePosts = Array.from(
        new Map(allPosts.map(post => [post.url, post])).values()
      )
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 10);

      return {
        topPosts: uniquePosts,
        keyMentions: keywordMentions,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error analyzing Reddit keywords:', error);
      // Retornar data vacía en caso de error
      return {
        topPosts: [],
        keyMentions: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Obtiene posts trending de subreddits de moda
   */
  static async getTrendingFashionPosts(limit: number = 10): Promise<RedditPost[]> {
    try {
      const posts: RedditPost[] = [];
      const subreddits = ['fashion', 'streetwear'];

      for (const subredditName of subreddits) {
        try {
          const data = await this.redditRequest(`/r/${subredditName}/hot.json?limit=5`);
          const children = data?.data?.children || [];

          for (const child of children) {
            const post = child.data;
            posts.push({
              title: post.title,
              subreddit: post.subreddit,
              upvotes: post.ups,
              url: `https://reddit.com${post.permalink}`,
              createdAt: new Date(post.created_utc * 1000),
            });
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error getting trending from r/${subredditName}:`, error);
        }
      }

      return posts
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending posts:', error);
      return [];
    }
  }
}
