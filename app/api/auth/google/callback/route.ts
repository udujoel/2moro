import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-calendar';
import { prisma } from '@/lib/db';

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback from Google
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // userId
        const error = searchParams.get('error');

        if (error) {
            console.error('Google OAuth error:', error);
            return NextResponse.redirect(new URL('/settings?error=oauth_denied', request.url));
        }

        if (!code || !state) {
            return NextResponse.redirect(new URL('/settings?error=missing_params', request.url));
        }

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(new URL('/settings?error=no_tokens', request.url));
        }

        // Store tokens in database
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

        return NextResponse.redirect(new URL('/settings?success=calendar_connected', request.url));
    } catch (error) {
        console.error('Error in Google OAuth callback:', error);
        return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url));
    }
}
