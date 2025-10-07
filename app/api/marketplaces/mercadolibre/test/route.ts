import { NextRequest, NextResponse } from 'next/server';
import { MercadoLibreTestService } from '@/services/marketplaces/mercadolibre/MercadoLibreTestService';

/**
 * POST /api/marketplaces/mercadolibre/test
 * Crea un usuario de prueba para testing en sandbox
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create_test_user') {
      // Crear usuario de prueba
      console.log('🔵 Creating test user...');
      const testUser = await MercadoLibreTestService.createTestUser();
      console.log('✅ Test user created successfully:', testUser.nickname);

      return NextResponse.json({
        success: true,
        data: {
          userId: testUser.id,
          nickname: testUser.nickname,
          password: testUser.password,
          message: 'Usuario de prueba creado exitosamente',
          expiresIn: '60 días',
        },
      });
    }

    if (action === 'cleanup_test_listings') {
      // Limpiar todas las publicaciones de prueba
      await MercadoLibreTestService.cleanupTestListings();

      return NextResponse.json({
        success: true,
        message: 'Publicaciones de prueba eliminadas',
      });
    }

    if (action === 'cleanup_expired_users') {
      // Limpiar usuarios expirados
      await MercadoLibreTestService.cleanupExpiredTestUsers();

      return NextResponse.json({
        success: true,
        message: 'Usuarios expirados limpiados',
      });
    }

    if (action === 'cleanup_all_sandbox') {
      // Limpiar TODO el sandbox (usuarios y credenciales)
      console.log('🧹 Cleaning up all sandbox data...');

      const clientPromise = (await import('@/mongodb')).default;
      const client = await clientPromise;
      const db = client.db('test');

      // Eliminar todos los test users
      const testUsersResult = await db.collection('mercadolibre_test_users').deleteMany({});
      console.log(`Deleted ${testUsersResult.deletedCount} test users`);

      // Eliminar todas las credenciales sandbox
      const credsResult = await db.collection('marketplace_credentials').deleteMany({
        marketplace: 'mercadolibre',
        isSandbox: true,
      });
      console.log(`Deleted ${credsResult.deletedCount} sandbox credentials`);

      // Eliminar todas las publicaciones sandbox
      const listingsResult = await db.collection('marketplace_listings').deleteMany({
        marketplace: 'mercadolibre',
        'metadata.isSandbox': true,
      });
      console.log(`Deleted ${listingsResult.deletedCount} sandbox listings`);

      return NextResponse.json({
        success: true,
        message: 'Sandbox completamente limpiado',
        data: {
          testUsersDeleted: testUsersResult.deletedCount,
          credentialsDeleted: credsResult.deletedCount,
          listingsDeleted: listingsResult.deletedCount,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Acción no válida',
          devMessage: 'Valid actions: create_test_user, cleanup_test_listings, cleanup_expired_users',
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in test endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error en operación de testing',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplaces/mercadolibre/test
 * Obtiene el estado del sandbox y usuario de prueba activo
 */
export async function GET() {
  try {
    const testUser = await MercadoLibreTestService.getActiveTestUser();
    console.log('🔍 Checking sandbox status, testUser:', testUser ? `Found: ${testUser.nickname}` : 'Not found');

    if (!testUser) {
      return NextResponse.json({
        success: true,
        data: {
          hasSandbox: false,
          message: 'No hay usuario sandbox activo. Crea uno para usar modo sandbox.',
        },
      });
    }

    // Calcular días restantes
    const now = new Date();
    const expiresAt = new Date(testUser.expiresAt);
    const daysRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`✅ Sandbox active: ${testUser.nickname}, ${daysRemaining} days remaining`);

    return NextResponse.json({
      success: true,
      data: {
        hasSandbox: true,
        userId: testUser.userId,
        nickname: testUser.nickname,
        createdAt: testUser.createdAt,
        expiresAt: testUser.expiresAt,
        daysRemaining,
      },
    });
  } catch (error) {
    console.error('Error getting test user:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener usuario de prueba',
          devMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
