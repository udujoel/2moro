import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateContentWithFallback } from "@/lib/ai";
import { auth } from "@/lib/auth";

/**
 * POST /api/oracle/future
 * Generate an AI-powered future projection based on user data
 */
export async function POST(req: NextRequest) {
    try {
        // Authenticate request
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { yearsAhead = 20 } = await req.json();

        // Fetch user data for context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                memories: {
                    take: 20,
                    orderBy: { createdAt: "desc" },
                    select: { content: true, title: true }
                },
                personalityTests: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: { mbtiType: true, description: true }
                },
                compassTodos: {
                    where: { status: "pending" },
                    take: 10,
                    select: { task: true, category: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Build context from user data
        const memoryContext = user.memories
            .map(m => m.content?.slice(0, 100))
            .join("\n");
        const personalityContext = user.personalityTests[0]
            ? `MBTI: ${user.personalityTests[0].mbtiType}\n${user.personalityTests[0].description?.slice(0, 200)}`
            : "";
        const goalsContext = user.compassTodos
            .map(t => `${t.category}: ${t.task}`)
            .join("\n");

        const prompt = `You are a wise, optimistic oracle creating a vivid, personalized vision of someone's life ${yearsAhead} years from now.

Based on the following information about ${user.name || "this person"}:

PERSONALITY:
${personalityContext || "A thoughtful, growth-oriented individual"}

RECENT EXPERIENCES & MEMORIES:
${memoryContext || "Someone who values meaningful connections and personal growth"}

CURRENT GOALS & ASPIRATIONS:
${goalsContext || "Working toward a fulfilling life with balance and purpose"}

Create an inspiring, detailed vision of their life ${yearsAhead} years from now. Include:
1. A vivid scene of a typical day in their future life
2. Their professional/creative accomplishments
3. Their relationships and connections
4. Their personal growth and wisdom gained
5. One unexpected but wonderful development

Write in second person ("You wake up to..."). Be specific, warm, and inspiring.
Keep it around 250-300 words. Make it feel like a gift of hope and possibility.`;

        const futureVision = await generateContentWithFallback(prompt);

        return NextResponse.json({
            success: true,
            vision: futureVision,
            yearsAhead
        });

    } catch (error: any) {
        console.error("[Oracle/Future] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

