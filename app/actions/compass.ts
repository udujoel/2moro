"use server";

import { generateContentWithSmartRouter } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getMonthlyHoroscope, getZodiacSign } from "@/lib/horoscope";
import { calculateFinancialHealthScore } from "@/lib/finance";
import { revalidatePath } from "next/cache";

/**
 * Save personality test results to database
 */
export async function savePersonalityTest(
    userId: string,
    mbtiType: string,
    description: string,
    traits: any,
    responses: any
) {
    try {
        const test = await prisma.personalityTest.create({
            data: {
                userId,
                mbtiType,
                description,
                traits,
                responses,
                testType: "mbti",
            },
        });

        revalidatePath("/compass");
        return { success: true, test };
    } catch (error: any) {
        console.error("Error saving personality test:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's latest personality test
 */
export async function getLatestPersonalityTest(userId: string) {
    try {
        const test = await prisma.personalityTest.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, test };
    } catch (error: any) {
        console.error("Error fetching personality test:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get or fetch monthly horoscope (with caching)
 */
export async function getMonthlyHoroscopeForUser(userId: string) {
    try {
        // Get or create user preferences
        let prefs = await prisma.userPreferences.findUnique({
            where: { userId },
        });

        if (!prefs) {
            prefs = await prisma.userPreferences.create({
                data: { userId },
            });
        }

        // Check if we need to fetch new horoscope (monthly refresh)
        const now = new Date();
        const needsRefresh =
            !prefs.lastHoroscopeFetch ||
            now.getMonth() !== prefs.lastHoroscopeFetch.getMonth() ||
            now.getFullYear() !== prefs.lastHoroscopeFetch.getFullYear();

        if (needsRefresh || !prefs.cachedHoroscope) {
            // Get user's zodiac sign from their profile/DOB
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { preferences: true },
            });

            // Try to get zodiac from user preferences or default to a generic one
            let zodiacSign = "aries";
            if (user?.preferences && typeof user.preferences === "object") {
                const userPrefs = user.preferences as any;
                if (userPrefs.zodiac) {
                    zodiacSign = userPrefs.zodiac;
                } else if (userPrefs.dob) {
                    // Calculate from DOB if available
                    const dob = new Date(userPrefs.dob);
                    zodiacSign = getZodiacSign(dob);
                }
            }

            // Fetch new horoscope
            const horoscope = await getMonthlyHoroscope(zodiacSign);

            // Update cache
            await prisma.userPreferences.update({
                where: { userId },
                data: {
                    cachedHoroscope: horoscope,
                    lastHoroscopeFetch: now,
                },
            });

            return { success: true, horoscope, zodiacSign };
        }

        return { success: true, horoscope: prefs.cachedHoroscope };
    } catch (error: any) {
        console.error("Error fetching horoscope:", error);
        return {
            success: false,
            error: error.message,
            horoscope: "Unable to fetch horoscope at this time.",
        };
    }
}

/**
 * Generate AI-powered recommendations based on personality and horoscope
 */
export async function generateAIRecommendations(userId: string) {
    try {
        // Fetch latest personality test
        const { test } = await getLatestPersonalityTest(userId);
        if (!test) {
            return {
                success: false,
                error: "No personality test found. Please complete the assessment first.",
            };
        }

        // Fetch monthly horoscope
        const { horoscope } = await getMonthlyHoroscopeForUser(userId);

        // Generate recommendations using Gemini AI
        const prompt = `
You are a life coach AI. Based on the following information, provide 8-12 atomic, actionable recommendations.

**Personality Type:** ${test.mbtiType}
**Personality Description:** ${test.description}
**Monthly Horoscope:** ${horoscope}

**Task:**
Generate 8-12 specific, actionable steps the user can take this month to improve their life.
Categorize each recommendation into one of these categories:
- Career
- Relationships
- Health
- Personal Development

Each recommendation should be:
- Specific and actionable (not vague)
- Achievable within a month
- Aligned with their personality type and current horoscope

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "category": "Career",
      "task": "Schedule 3 networking coffee chats with industry peers",
      "description": "Leverage your extroverted nature to build professional connections"
    },
    ...
  ]
}
`;

        const response = await generateContentWithSmartRouter(prompt, "smart");

        // Parse JSON response
        const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return { success: true, recommendations: data.recommendations };
    } catch (error: any) {
        console.error("Error generating AI recommendations:", error);
        return {
            success: false,
            error: error.message,
            recommendations: [],
        };
    }
}

/**
 * Accept a recommendation and create a CompassTodo
 */
export async function acceptRecommendation(
    userId: string,
    recommendation: {
        category: string;
        task: string;
        description?: string;
    }
) {
    try {
        // Use AI to break down into timeframes
        const prompt = `
Given this task: "${recommendation.task}"
Description: "${recommendation.description || ""}"

Break it down into specific actions for different timeframes.
Determine if this is primarily a:
- "today" task (can be done in one sitting, < 2 hours)
- "week" task (needs a few days, multiple sessions)
- "month" task (long-term goal, needs weeks)

Return ONLY valid JSON:
{
  "timeframe": "today" | "week" | "month",
  "breakdown": "A brief description of how to approach this task"
}
`;

        const response = await generateContentWithSmartRouter(prompt, "fast");
        const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);

        // Create the todo
        const todo = await prisma.compassTodo.create({
            data: {
                userId,
                task: recommendation.task,
                description: recommendation.description || data.breakdown,
                category: recommendation.category,
                timeframe: data.timeframe,
                status: "pending",
                source: "ai",
            },
        });

        revalidatePath("/compass");
        return { success: true, todo };
    } catch (error: any) {
        console.error("Error accepting recommendation:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get todos by timeframe
 */
export async function getTodosByTimeframe(userId: string, timeframe: string) {
    try {
        const todos = await prisma.compassTodo.findMany({
            where: {
                userId,
                timeframe,
                status: "pending",
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, todos };
    } catch (error: any) {
        console.error("Error fetching todos:", error);
        return { success: false, error: error.message, todos: [] };
    }
}

/**
 * Update todo status (complete/pending)
 */
export async function updateTodoStatus(
    todoId: string,
    status: "pending" | "completed" | "dismissed"
) {
    try {
        const todo = await prisma.compassTodo.update({
            where: { id: todoId },
            data: {
                status,
                completedAt: status === "completed" ? new Date() : null,
                dismissedAt: status === "dismissed" ? new Date() : null,
            },
        });

        revalidatePath("/compass");
        return { success: true, todo };
    } catch (error: any) {
        console.error("Error updating todo status:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a manual todo
 */
export async function createTodo(
    userId: string,
    task: string,
    category: string,
    timeframe: string,
    description?: string
) {
    try {
        const todo = await prisma.compassTodo.create({
            data: {
                userId,
                task,
                description,
                category,
                timeframe,
                status: "pending",
                source: "manual",
            },
        });

        revalidatePath("/compass");
        return { success: true, todo };
    } catch (error: any) {
        console.error("Error creating todo:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a todo
 */
export async function deleteTodo(todoId: string) {
    try {
        await prisma.compassTodo.delete({
            where: { id: todoId },
        });

        revalidatePath("/compass");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting todo:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate user's completion streak
 */
export async function calculateStreak(userId: string) {
    try {
        const completedTodos = await prisma.compassTodo.findMany({
            where: {
                userId,
                status: "completed",
                completedAt: { not: null },
            },
            orderBy: { completedAt: "desc" },
            select: { completedAt: true },
        });

        if (completedTodos.length === 0) {
            return { success: true, streak: 0 };
        }

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Group by date
        const dateMap = new Map<string, number>();
        completedTodos.forEach((todo) => {
            if (todo.completedAt) {
                const dateKey = todo.completedAt.toISOString().split("T")[0];
                dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
            }
        });

        // Calculate streak
        while (true) {
            const dateKey = currentDate.toISOString().split("T")[0];
            if (dateMap.has(dateKey)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return { success: true, streak };
    } catch (error: any) {
        console.error("Error calculating streak:", error);
        return { success: false, error: error.message, streak: 0 };
    }
}

/**
 * Get completion heatmap data (for calendar visualization)
 */
export async function getCompletionHeatmap(userId: string, year: number) {
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const completedTodos = await prisma.compassTodo.findMany({
            where: {
                userId,
                status: "completed",
                completedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { completedAt: true },
        });

        // Group by date
        const heatmapData: Record<string, number> = {};
        completedTodos.forEach((todo) => {
            if (todo.completedAt) {
                const dateKey = todo.completedAt.toISOString().split("T")[0];
                heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
            }
        });

        return { success: true, heatmapData };
    } catch (error: any) {
        console.error("Error fetching heatmap data:", error);
        return { success: false, error: error.message, heatmapData: {} };
    }
}
