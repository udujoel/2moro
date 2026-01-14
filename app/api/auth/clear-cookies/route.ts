import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/clear-cookies
 * 
 * Emergency endpoint to clear oversized auth cookies.
 * This fixes the HTTP 431 error caused by cookies exceeding 4KB.
 */
export async function GET() {
    const cookieStore = await cookies();

    // Get all cookie names that start with "authjs" or "__Secure-authjs"
    const allCookies = cookieStore.getAll();
    const authCookies = allCookies.filter(c =>
        c.name.startsWith("authjs") ||
        c.name.startsWith("__Secure-authjs") ||
        c.name.startsWith("next-auth")
    );

    // Delete each auth cookie
    for (const cookie of authCookies) {
        cookieStore.delete(cookie.name);
    }

    return NextResponse.json({
        success: true,
        cleared: authCookies.map(c => c.name),
        message: "Auth cookies cleared. Please refresh the page and try logging in again."
    });
}
