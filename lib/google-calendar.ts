/**
 * Google Calendar Integration Utilities
 * Handles OAuth flow and calendar event creation
 */

import { google } from 'googleapis';

// OAuth2 client configuration
export function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );
}

// Scopes for calendar access
export const CALENDAR_SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
];

// Generate OAuth URL for calendar authorization
export function getCalendarAuthUrl(userId: string) {
    const oauth2Client = getOAuth2Client();

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: CALENDAR_SCOPES,
        prompt: 'consent',
        state: userId, // Pass userId to callback
    });

    return url;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

// Get calendar client with stored tokens
export function getCalendarClient(accessToken: string, refreshToken: string) {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Create a calendar event
export async function createCalendarEvent(
    accessToken: string,
    refreshToken: string,
    event: {
        summary: string;
        description?: string;
        startDate: Date;
        endDate?: Date;
        allDay?: boolean;
    }
) {
    const calendar = getCalendarClient(accessToken, refreshToken);

    const eventBody: any = {
        summary: event.summary,
        description: event.description || '',
    };

    if (event.allDay) {
        // All-day event
        eventBody.start = {
            date: event.startDate.toISOString().split('T')[0],
        };
        eventBody.end = {
            date: (event.endDate || event.startDate).toISOString().split('T')[0],
        };
    } else {
        // Timed event
        eventBody.start = {
            dateTime: event.startDate.toISOString(),
            timeZone: 'UTC',
        };
        eventBody.end = {
            dateTime: (event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)).toISOString(),
            timeZone: 'UTC',
        };
    }

    const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventBody,
    });

    return response.data;
}

// Get calendar list to verify connection
export async function getCalendarList(accessToken: string, refreshToken: string) {
    const calendar = getCalendarClient(accessToken, refreshToken);
    const response = await calendar.calendarList.list();
    return response.data.items || [];
}

// Calculate due date based on timeframe
export function calculateDueDate(timeframe: string): Date {
    const now = new Date();

    switch (timeframe) {
        case 'today':
            return now;
        case 'week':
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
            return endOfWeek;
        case 'month':
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return endOfMonth;
        default:
            return now;
    }
}
