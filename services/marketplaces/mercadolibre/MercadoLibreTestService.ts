import { MercadoLibreAuthService } from './MercadoLibreAuthService';
import clientPromise from '@/mongodb';

interface TestUser {
  id: number;
  nickname: string;
  password: string;
  site_status: string;
  access_token?: string; // MercadoLibre incluye el token en la respuesta
}

export class MercadoLibreTestService {
  /**
   * Crea un usuario de prueba en MercadoLibre
   * Los usuarios de prueba expiran después de 60 días
   */
  static async createTestUser(siteId: string = 'MLM'): Promise<TestUser> {
    try {
      const accessToken = await MercadoLibreAuthService.getValidCredentials();

      const response = await fetch(
        `https://api.mercadolibre.com/users/test_user?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site_id: siteId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create test user: ${JSON.stringify(error)}`);
      }

      const testUser = await response.json();

      console.log('🧪 Test user created:', {
        id: testUser.id,
        nickname: testUser.nickname,
        hasAccessToken: !!testUser.access_token,
        keys: Object.keys(testUser)
      });

      // Guardar usuario de prueba en MongoDB
      await this.saveTestUser(testUser);

      return testUser;
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }

  /**
   * Obtiene el usuario de prueba activo
   */
  static async getActiveTestUser(): Promise<TestUser | null> {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('mercadolibre_test_users');

    // Buscar usuario de prueba que no haya expirado (menos de 60 días)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const testUser = await collection.findOne({
      createdAt: { $gte: sixtyDaysAgo },
      active: true,
    });

    return testUser as any;
  }

  /**
   * Guarda usuario de prueba en MongoDB y crea sus credenciales
   *
   * IMPORTANTE: Los test users NO tienen su propio access token.
   * Se usa el access token de la cuenta creadora para hacer peticiones
   * en nombre del test user, agregando el parámetro ?user_id={test_user_id}
   */
  private static async saveTestUser(testUser: TestUser) {
    const client = await clientPromise;
    const db = client.db('test');

    // Guardar en colección de test users
    const testUsersCollection = db.collection('mercadolibre_test_users');
    await testUsersCollection.insertOne({
      userId: testUser.id,
      nickname: testUser.nickname,
      password: testUser.password,
      siteStatus: testUser.site_status,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
      active: true,
    });

    try {
      // Obtener el access token de la cuenta real (creadora)
      const realAccountToken = await MercadoLibreAuthService.getValidCredentials(false);

      // Guardar "credenciales" sandbox que realmente apuntan al token de la cuenta real
      // pero marcan que las peticiones deben incluir ?user_id={test_user_id}
      const credsCollection = db.collection('marketplace_credentials');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 días

      await credsCollection.insertOne({
        marketplace: 'mercadolibre',
        isSandbox: true,
        meliUserId: testUser.id.toString(),
        accessToken: realAccountToken, // Usamos el token de la cuenta real
        refreshToken: null,
        expiresAt,
        siteId: 'MLM',
        nickname: testUser.nickname,
        email: `${testUser.nickname}@testuser.com`,
        active: true,
        connectedAt: new Date(),
        lastRefresh: new Date(),
        metadata: {
          password: testUser.password,
          siteStatus: testUser.site_status,
          isTestUser: true,
          testUserId: testUser.id, // ID del usuario de prueba para agregar en queries
        },
      });

      console.log(`✅ Sandbox credentials saved for test user: ${testUser.nickname} (ID: ${testUser.id})`);
    } catch (error) {
      console.error('Error saving sandbox credentials:', error);
      throw error;
    }
  }

  /**
   * Verifica si el modo test está habilitado
   */
  static isTestMode(): boolean {
    return process.env.MELI_TEST_MODE === 'true';
  }

  /**
   * Limpia usuarios de prueba expirados
   */
  static async cleanupExpiredTestUsers() {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('mercadolibre_test_users');

    const now = new Date();

    await collection.updateMany(
      { expiresAt: { $lt: now } },
      { $set: { active: false } }
    );
  }

  /**
   * Elimina todas las publicaciones de sandbox
   */
  static async cleanupTestListings() {
    const client = await clientPromise;
    const db = client.db('test');
    const listingsCollection = db.collection('marketplace_listings');

    // Buscar todas las publicaciones marcadas como sandbox
    const sandboxListings = await listingsCollection
      .find({
        marketplace: 'mercadolibre',
        'metadata.isSandbox': true,
      })
      .toArray();

    // Eliminar cada publicación en MercadoLibre
    const MercadoLibreListingService = require('./MercadoLibreListingService')
      .MercadoLibreListingService;

    let deleted = 0;
    let failed = 0;

    for (const listing of sandboxListings) {
      try {
        await MercadoLibreListingService.deleteListing(listing.externalId);
        console.log(`✅ Deleted sandbox listing: ${listing.externalId}`);
        deleted++;
      } catch (error) {
        console.error(`❌ Failed to delete sandbox listing ${listing.externalId}:`, error);
        failed++;
      }
    }

    // Eliminar de la base de datos
    const result = await listingsCollection.deleteMany({
      marketplace: 'mercadolibre',
      'metadata.isSandbox': true,
    });

    console.log(`Cleanup complete: ${deleted} deleted, ${failed} failed, ${result.deletedCount} removed from DB`);

    return {
      deleted,
      failed,
      removedFromDB: result.deletedCount,
    };
  }
}
