"use server";

import { prisma } from "@/lib/db";
import { generateContentWithFallback } from "@/lib/ai";
import { getServerUser } from "@/lib/session";

export interface DashboardStats {
    total: number;
    thisYear: number;
    thisMonth: number;
    thisWeek: number;
}

export interface TopPerson {
    id: string;
    name: string;
    count: number;
    avatar?: string;
    lastInteraction?: Date;
}

/**
 * Get dashboard statistics for the authenticated user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    const { userId } = await getServerUser();

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of current week (Sunday)

    const [total, thisYear, thisMonth, thisWeek] = await Promise.all([
        prisma.memory.count({ where: { userId } }),
        prisma.memory.count({ where: { userId, memoryDate: { gte: startOfYear } } }),
        prisma.memory.count({ where: { userId, memoryDate: { gte: startOfMonth } } }),
        prisma.memory.count({ where: { userId, memoryDate: { gte: startOfWeek } } }),
    ]);

    return { total, thisYear, thisMonth, thisWeek };
}

/**
 * Get top people/connections for the authenticated user
 */
export async function getTopPeople(limit: number = 5): Promise<TopPerson[]> {
    const { userId } = await getServerUser();

    const people = await prisma.person.findMany({
        where: { userId },
        include: {
            _count: {
                select: { memories: true }
            },
            memories: {
                take: 1,
                orderBy: { memoryDate: 'desc' },
                select: { memoryDate: true }
            }
        },
        orderBy: {
            memories: {
                _count: 'desc'
            }
        },
        take: limit
    });

    return people.map((p: any) => ({
        id: p.id,
        name: p.name,
        count: p._count.memories,
        avatar: p.image || undefined,
        lastInteraction: p.memories[0]?.memoryDate
    }));
}

/**
 * Get AI-powered greeting for the authenticated user
 */
export async function getAiGreeting(timeOfDay: string): Promise<{ greeting: string, message: string }> {
    const { userId } = await getServerUser();

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    if (!user) return { greeting: "Hello", message: "Welcome back." };

    const name = user.name?.split(' ')[0] || "Traveler";

    const prompt = `
        Generate a very short, warm, and astute greeting message for a user named ${name}.
        Time of day: ${timeOfDay}.
        Context: The user is opening their "Life OS" dashboard.
        
        Output format JSON:
        {
            "greeting": "Good Morning, ${name}",
            "message": "One brief, inspiring sentence about focus or memory."
        }
    `;

    try {
        const result = await generateContentWithFallback(prompt);
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.warn("AI Greeting Failed (Using Router Fallback).", e);
        return {
            greeting: `Good ${timeOfDay}, ${name}`,
            message: "Ready to capture a new day?"
        };
    }
}

/**
 * Get autobiography snippets for the authenticated user
 */
export async function getAutobiographySnippets(): Promise<string[]> {
    const { userId } = await getServerUser();

    const memories = await prisma.memory.findMany({
        where: { userId },
        orderBy: { memoryDate: 'desc' },
        take: 10,
        select: { content: true, memoryDate: true }
    });

    if (memories.length === 0) {
        return [
            "Your story is just beginning.",
            "Capture a memory to start your autobiography.",
            "Every day is a new page."
        ];
    }

    const memoryText = memories.map((m: any) => m.content).join("\n");
    const prompt = `
        Based on these recent diary entries/memories, write 3 distinct, beautiful sentences that sound like they belong in the user's autobiography.
        They should be written in the first person (I...).
        They should be reflective and somewhat poetic but grounded.
        Return ONLY a JSON array of strings.

        Memories:
        ${memoryText}
    `;

    try {
        const result = await generateContentWithFallback(prompt);
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return Array.isArray(parsed) ? parsed : ["Writing your story..."];
    } catch (e) {
        console.warn("Autobiography Gen Failed (Using Router Fallback).", e);
        return [
            "Your story is unfolding day by day.",
            "Capture the moments that matter.",
            "Reflect on your journey here."
        ];
    }
}

/**
 * Handle AI query action (doesn't need userId - uses prompt only)
 */
export async function handleAiQueryAction(query: string): Promise<string> {
    const prompt = `
        You are an intelligent audio assistant for a personal Life OS.
        User Query: "${query}"
        
        Provide a concise, helpful, and warm spoken response (text that will be spoken).
        Keep it under 2 sentences.
    `;
    try {
        return await generateContentWithFallback(prompt);
    } catch (e) {
        console.warn("AI Audio Query Failed.", e);
        return "I'm having trouble connecting to my thought process right now. Please try again later.";
    }
}

export interface ActivityData {
    habits: {
        id: string;
        title: string;
        streak: number;
        completedToday: boolean;
    }[];
    recentMemories: {
        id: string;
        type: string;
        preview: string;
        time: string;
        date: string;
    }[];
}

/**
 * Get activity data (habits + recent memories) for the authenticated user
 */
export async function getActivityData(): Promise<ActivityData> {
    const { userId } = await getServerUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [habits, memories] = await Promise.all([
        prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.memory.findMany({
            where: { userId },
            orderBy: { memoryDate: 'desc' },
            take: 5,
            select: { id: true, type: true, content: true, memoryDate: true }
        })
    ]);

    return {
        habits: habits.map(h => ({
            id: h.id,
            title: h.title,
            streak: h.streak,
            completedToday: (h as any).lastCompletedAt ? new Date((h as any).lastCompletedAt) >= today : false
        })),
        recentMemories: memories.map(m => ({
            id: m.id,
            type: m.type,
            preview: m.content.substring(0, 50) + (m.content.length > 50 ? "..." : ""),
            time: m.memoryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: m.memoryDate.toLocaleDateString()
        }))
    };
}
