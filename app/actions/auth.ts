"use server";

import { auth } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/actions";

/**
 * Get the current authenticated user's ID from NextAuth session
 * Used by server components and server actions to get the current user
 */
export async function getSessionUser(): Promise<string | null> {
    const session = await auth();
    return session?.user?.id ?? null;
}

/**
 * Legacy login action - still used for some flows
 * @deprecated Use NextAuth signIn instead
 */
export async function loginAction(email: string, name: string) {
    const user = await getOrCreateUser(email, name);
    return user;
}

/**
 * Legacy logout action
 * @deprecated Use NextAuth signOut instead
 */
export async function logoutAction() {
    // No-op, NextAuth handles session cleanup
}
