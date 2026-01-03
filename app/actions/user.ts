"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUserPreferences(userId: string) {
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        return user?.preferences as any || {};
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return {};
    }
}

export async function updatePreferences(userId: string, preferences: any) {
    if (!userId) return null;

    try {
        // Merge with existing preferences
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });

        const newPreferences = {
            ...(currentUser?.preferences as object),
            ...preferences,
        };

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: newPreferences,
            },
        });
        revalidatePath("/dashboard");
        return user.preferences;
    } catch (error) {
        console.error("Error updating preferences:", error);
        return null;
    }
}
