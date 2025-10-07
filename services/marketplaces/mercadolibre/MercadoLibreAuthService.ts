import clientPromise from '@/mongodb';

interface MercadoLibreTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: number;
  scope: string;
}

interface MercadoLibreUserInfo {
  id: number;
  nickname: string;
  email: string;
  first_name: string;
  last_name: string;
  country_id: string;
  address?: {
    city: string;
    state: string;
  };
  phone?: {
    area_code: string;
    number: string;
  };
  points: number;
  seller_reputation?: {
    level_id: string;
  };
}

export class MercadoLibreAuthService {
  private static readonly CLIENT_ID = process.env.MELI_CLIENT_ID;
  private static readonly CLIENT_SECRET = process.env.MELI_CLIENT_SECRET;
  private static readonly REDIRECT_URI = process.env.MELI_REDIRECT_URI;
  private static readonly AUTH_URL = 'https://auth.mercadolibre.com.mx/authorization';
  private static readonly TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';
  private static readonly USER_INFO_URL = 'https://api.mercadolibre.com/users/me';

  /**
   * Genera URL de autorización para OAuth
   */
  static getAuthorizationUrl(state?: string): string {
    if (!this.CLIENT_ID || !this.REDIRECT_URI) {
      throw new Error('MercadoLibre credentials not configured');
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      ...(state && { state }),
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Intercambia código de autorización por access token
   */
  static async getAccessToken(code: string): Promise<MercadoLibreTokenResponse> {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET || !this.REDIRECT_URI) {
      throw new Error('MercadoLibre credentials not configured');
    }

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        code,
        redirect_uri: this.REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Refresca access token usando refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<MercadoLibreTokenResponse> {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error('MercadoLibre credentials not configured');
    }

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Obtiene información del usuario autenticado
   */
  static async getUserInfo(accessToken: string): Promise<MercadoLibreUserInfo> {
    const response = await fetch(this.USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get user info: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Guarda credenciales en MongoDB
   */
  static async saveCredentials(data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    userId: number;
    userInfo: MercadoLibreUserInfo;
  }) {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expiresIn);

    const credentials = {
      marketplace: 'mercadolibre',
      meliUserId: data.userId.toString(),
      accessToken: data.accessToken, // TODO: Encriptar en producción
      refreshToken: data.refreshToken, // TODO: Encriptar en producción
      expiresAt,
      siteId: 'MLM', // México
      nickname: data.userInfo.nickname,
      email: data.userInfo.email,
      active: true,
      connectedAt: new Date(),
      lastRefresh: new Date(),
      metadata: {
        firstName: data.userInfo.first_name,
        lastName: data.userInfo.last_name,
        countryId: data.userInfo.country_id,
        points: data.userInfo.points,
        reputation: data.userInfo.seller_reputation?.level_id || 'unknown',
      },
    };

    await collection.updateOne(
      { marketplace: 'mercadolibre', meliUserId: data.userId.toString() },
      { $set: credentials },
      { upsert: true }
    );

    return credentials;
  }

  /**
   * Obtiene credenciales válidas (refresca si es necesario)
   */
  static async getValidCredentials(): Promise<string> {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    const creds = await collection.findOne({
      marketplace: 'mercadolibre',
      active: true,
    });

    if (!creds) {
      throw new Error('No MercadoLibre credentials found. Please connect your account first.');
    }

    // Si el token está por expirar (menos de 1 hora), refrescarlo
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    if (creds.expiresAt < oneHourFromNow) {
      console.log('Access token expiring soon, refreshing...');

      const refreshed = await this.refreshAccessToken(creds.refreshToken);

      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshed.expires_in);

      await collection.updateOne(
        { _id: creds._id },
        {
          $set: {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresAt: newExpiresAt,
            lastRefresh: new Date(),
          },
        }
      );

      return refreshed.access_token;
    }

    return creds.accessToken;
  }

  /**
   * Verifica si hay una cuenta conectada
   */
  static async isConnected(): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    const creds = await collection.findOne({
      marketplace: 'mercadolibre',
      active: true,
    });

    return !!creds;
  }

  /**
   * Obtiene información de la cuenta conectada
   */
  static async getConnectedAccount() {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    const creds = await collection.findOne({
      marketplace: 'mercadolibre',
      active: true,
    });

    if (!creds) {
      return null;
    }

    return {
      meliUserId: creds.meliUserId,
      nickname: creds.nickname,
      email: creds.email,
      siteId: creds.siteId,
      connectedAt: creds.connectedAt,
      metadata: creds.metadata,
    };
  }

  /**
   * Desconecta la cuenta de MercadoLibre
   */
  static async disconnect() {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('marketplace_credentials');

    await collection.updateOne(
      { marketplace: 'mercadolibre', active: true },
      {
        $set: {
          active: false,
          disconnectedAt: new Date(),
        },
      }
    );
  }
}
