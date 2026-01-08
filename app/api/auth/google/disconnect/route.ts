import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/app/actions/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/auth/google/disconnect
 * Disconnects Google Calendar integration
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getSessionUser();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Remove tokens from database
        await prisma.userPreferences.update({
            where: { userId },
            data: {
                googleCalendarEnabled: false,
                googleAccessToken: null,
                googleRefreshToken: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting Google Calendar:', error);
        return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
}
