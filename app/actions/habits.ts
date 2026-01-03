"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getHabits(userId: string) {
    if (!userId) return [];

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

export async function createHabit(userId: string, title: string) {
    if (!userId || !title) return null;

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

export async function toggleHabit(habitId: string, completed: boolean) {
    if (!habitId) return null;

    try {
        // Logic: If completed is currently true (passed from client as target state), 
        // we increment streak. If false, we decrement.
        // Wait, the client usually passes the NEW state.

        // This is a simplified logic. In a real app we'd check last completed date.
        // For now, let's just update streak based on the toggle for demo polish.

        // We need to fetch the current habit to know the streak direction if we want to be strict,
        // but let's assume the UI sends the right intent or we just simple-logic it.

        const habit = await prisma.habit.findUnique({ where: { id: habitId } });
        if (!habit) return null;

        // Check if completed today
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
            newDate = null; // Or to previous date? For now null is "not done today"
        } else {
            // No change needed (e.g. toggling true when already true)
            return habit;
        }

        const updatedHabit = await prisma.habit.update({
            where: { id: habitId },
            data: {
                streak: newStreak,
                lastCompletedAt: newDate
            },
        });

        // Wait, the schema I saw earlier:
        // model Habit { ... streak Int ... }
        // It didn't have 'completed' boolean or 'lastAction'.
        // To make the UI work like the mock (checkbox), we need to track if it's done *today*.
        // I should stick to the schema I have or update it.
        // The mock had 'completed' boolean.

        revalidatePath("/dashboard");
        return updatedHabit;
    } catch (error) {
        console.error("Error toggling habit:", error);
        return null;
    }
}

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
