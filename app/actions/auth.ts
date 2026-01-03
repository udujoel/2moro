"use server";

import { cookies } from "next/headers";
import { getOrCreateUser } from "@/lib/actions";

export async function loginAction(email: string, name: string) {
    const user = await getOrCreateUser(email, name);
    if (user) {
        const isProduction = process.env.NODE_ENV === "production";
        (await cookies()).set("userId", user.id, {
            secure: isProduction,
            httpOnly: true,
            path: '/',
            sameSite: 'lax'
        });
        return user;
    }
    return null;
}

export async function logoutAction() {
    (await cookies()).delete("userId");
}

export async function getSessionUser() {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) return null;
    return userId;
}
