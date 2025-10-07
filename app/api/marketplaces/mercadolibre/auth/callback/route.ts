import { NextRequest, NextResponse } from 'next/server';
import { MercadoLibreAuthService } from '@/services/marketplaces/mercadolibre/MercadoLibreAuthService';

/**
 * GET /api/marketplaces/mercadolibre/auth/callback
 * Callback de OAuth de MercadoLibre
 * Intercambia el código de autorización por tokens de acceso
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Si el usuario rechazó la autorización
    if (error) {
      console.error('OAuth authorization error:', error);
      return NextResponse.redirect(
        new URL('/marketplaces?error=authorization_denied', request.url)
      );
    }

    // Verificar que tenemos el código
    if (!code) {
      return NextResponse.redirect(
        new URL('/marketplaces?error=missing_code', request.url)
      );
    }

    // Intercambiar código por tokens
    const tokens = await MercadoLibreAuthService.getAccessToken(code);

    // Obtener información del usuario
    const userInfo = await MercadoLibreAuthService.getUserInfo(tokens.access_token);

    // Guardar credenciales en MongoDB
    await MercadoLibreAuthService.saveCredentials({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      userId: tokens.user_id,
      userInfo,
    });

    console.log(`MercadoLibre account connected: ${userInfo.nickname} (${userInfo.id})`);

    // Redirigir al dashboard con éxito
    return NextResponse.redirect(
      new URL('/marketplaces?connected=true', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);

    return NextResponse.redirect(
      new URL('/marketplaces?error=callback_failed', request.url)
    );
  }
}
