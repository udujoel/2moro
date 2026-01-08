import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/app/actions/auth';
import { getCalendarAuthUrl } from '@/lib/google-calendar';

/**
 * GET /api/auth/google/calendar
 * Initiates Google Calendar OAuth flow
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getSessionUser();

        if (!userId) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const authUrl = getCalendarAuthUrl(userId);
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Error initiating Google Calendar OAuth:', error);
        return NextResponse.redirect(new URL('/settings?error=oauth_init_failed', request.url));
    }
}
