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

    // Detectar el dominio desde la URL del request
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // Si el usuario rechazó la autorización
    if (error) {
      console.error('OAuth authorization error:', error);
      return NextResponse.redirect(
        `${baseUrl}/marketplaces?error=authorization_denied`
      );
    }

    // Verificar que tenemos el código
    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/marketplaces?error=missing_code`
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
      `${baseUrl}/marketplaces?connected=true`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);

    // Detectar el dominio desde la URL del request
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    return NextResponse.redirect(
      `${baseUrl}/marketplaces?error=callback_failed`
    );
  }
}
