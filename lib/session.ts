import { auth } from "@/lib/auth";

/**
 * Server-side helper to get the authenticated user's ID.
 * Use this in server actions and API routes to securely identify the user.
 * 
 * @throws Error if the user is not authenticated
 * @returns { userId: string } The authenticated user's ID
 */
export async function getServerUser(): Promise<{ userId: string }> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized: No valid session");
    }

    return { userId: session.user.id };
}

/**
 * Optional variant that returns null instead of throwing.
 * Useful for API routes that need to return 401 responses.
 */
export async function getServerUserOrNull(): Promise<{ userId: string } | null> {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    return { userId: session.user.id };
}
