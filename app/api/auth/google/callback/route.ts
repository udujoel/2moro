import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-calendar';
import { prisma } from '@/lib/db';

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback from Google
 */
export async function GET(request: NextRequest) {
    console.log('[Google OAuth Callback] Started');

    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // userId
        const error = searchParams.get('error');

        console.log('[Google OAuth Callback] Params:', {
            hasCode: !!code,
            state,
            error,
            url: request.url
        });

        if (error) {
            console.error('[Google OAuth Callback] OAuth error:', error);
            return NextResponse.redirect(new URL('/settings?error=oauth_denied', request.url));
        }

        if (!code || !state) {
            console.error('[Google OAuth Callback] Missing params:', { code: !!code, state: !!state });
            return NextResponse.redirect(new URL('/settings?error=missing_params', request.url));
        }

        // Exchange code for tokens
        console.log('[Google OAuth Callback] Exchanging code for tokens...');
        const tokens = await exchangeCodeForTokens(code);
        console.log('[Google OAuth Callback] Tokens received:', {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token
        });

        if (!tokens.access_token || !tokens.refresh_token) {
            console.error('[Google OAuth Callback] Missing tokens');
            return NextResponse.redirect(new URL('/settings?error=no_tokens', request.url));
        }

        // Store tokens in database
        console.log('[Google OAuth Callback] Saving tokens for user:', state);
        await prisma.userPreferences.upsert({
            where: { userId: state },
            create: {
                userId: state,
                googleCalendarEnabled: true,
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
            },
            update: {
                googleCalendarEnabled: true,
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
            },
        });

        console.log('[Google OAuth Callback] Success! Redirecting to settings');
        return NextResponse.redirect(new URL('/settings?success=calendar_connected', request.url));
    } catch (error) {
        console.error('[Google OAuth Callback] Error:', error);
        return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url));
    }
}
