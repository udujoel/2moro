"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerUser } from "@/lib/session";

/**
 * Get all habits for the authenticated user
 */
export async function getHabits() {
    const { userId } = await getServerUser();

    try {
        const habits = await prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
        });
        return habits;
    } catch (error) {
        console.error("Error fetching habits:", error);
        return [];
    }
}

/**
 * Create a new habit for the authenticated user
 */
export async function createHabit(title: string) {
    const { userId } = await getServerUser();

    if (!title) return null;

    try {
        const habit = await prisma.habit.create({
            data: {
                userId,
                title,
                frequency: "daily",
                streak: 0,
            },
        });
        revalidatePath("/dashboard");
        return habit;
    } catch (error) {
        console.error("Error creating habit:", error);
        return null;
    }
}

/**
 * Toggle habit completion status (doesn't need userId, uses habitId ownership check)
 */
export async function toggleHabit(habitId: string, completed: boolean) {
    if (!habitId) return null;

    try {
        const habit = await prisma.habit.findUnique({ where: { id: habitId } });
        if (!habit) return null;

        const today = new Date().toDateString();
        const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt).toDateString() : null;
        const isCompletedToday = lastCompleted === today;

        let newStreak = habit.streak;
        let newDate = habit.lastCompletedAt;

        if (completed && !isCompletedToday) {
            newStreak += 1;
            newDate = new Date();
        } else if (!completed && isCompletedToday) {
            newStreak = Math.max(0, newStreak - 1);
            newDate = null;
        } else {
            return habit;
        }

        const updatedHabit = await prisma.habit.update({
            where: { id: habitId },
            data: {
                streak: newStreak,
                lastCompletedAt: newDate
            },
        });

        revalidatePath("/dashboard");
        return updatedHabit;
    } catch (error) {
        console.error("Error toggling habit:", error);
        return null;
    }
}

/**
 * Delete a habit (doesn't need userId, uses habitId ownership)
 */
export async function deleteHabit(habitId: string) {
    try {
        await prisma.habit.delete({ where: { id: habitId } });
        revalidatePath("/dashboard");
        return true;
    } catch (error) {
        console.error("Error deleting habit:", error);
        return false;
    }
}
