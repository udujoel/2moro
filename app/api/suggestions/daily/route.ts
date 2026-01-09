import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(req: NextRequest) {
    try {
        // Simple user ID extraction from headers/cookies
        // In production, use proper session management
        const userId = req.cookies.get("userId")?.value;

        if (!userId) {
            // For now, return fallback suggestions without user auth
            const fallbackSuggestions = getFallbackSuggestions();
            return NextResponse.json({
                suggestions: fallbackSuggestions,
                generatedAt: new Date(),
                canRegenerate: true,
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check for existing valid suggestions (not expired)
        const now = new Date();
        const existingSuggestions = await prisma.memorySuggestion.findMany({
            where: {
                userId: user.id,
                expiresAt: { gt: now },
            },
            orderBy: { generatedAt: "desc" },
            take: 3,
        });

        if (existingSuggestions.length > 0) {
            return NextResponse.json({
                suggestions: existingSuggestions.map((s) => s.content),
                generatedAt: existingSuggestions[0].generatedAt,
                canRegenerate: true,
            });
        }

        // Generate new suggestions
        const suggestions = await generateSuggestions(user.id);

        // Calculate end of day for expiration
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Save to database
        await prisma.memorySuggestion.createMany({
            data: suggestions.map((content) => ({
                userId: user.id,
                content,
                expiresAt: endOfDay,
            })),
        });

        return NextResponse.json({
            suggestions,
            generatedAt: new Date(),
            canRegenerate: true,
        });
    } catch (error) {
        console.error("Error fetching daily suggestions:", error);
        return NextResponse.json(
            { error: "Failed to fetch suggestions" },
            { status: 500 }
        );
    }
}

async function generateSuggestions(userId: string): Promise<string[]> {
    try {
        // Fetch user context data
        const [compassTodos, recentMemories, user] = await Promise.all([
            prisma.compassTodo.findMany({
                where: {
                    userId,
                    status: "pending",
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.memory.findMany({
                where: { userId },
                orderBy: { memoryDate: "desc" },
                take: 3,
            }),
            prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userPreferences: true,
                },
            }),
        ]);

        // Build context for AI
        const context = {
            date: new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            todos: compassTodos.map((t) => ({
                task: t.task,
                category: t.category,
                timeframe: t.timeframe,
            })),
            recentMemoryThemes: recentMemories.map((m) => m.title || m.content.substring(0, 50)),
        };

        const prompt = `You are a thoughtful memory journaling assistant. Based on the following context, generate 2-3 creative, personalized memory prompts that would help the user reflect on their day and capture meaningful moments.

Context:
- Today is: ${context.date}
- User's active goals/tasks: ${context.todos.length > 0 ? JSON.stringify(context.todos) : "None listed"}
- Recent memory themes: ${context.recentMemoryThemes.length > 0 ? context.recentMemoryThemes.join(", ") : "No recent memories"}

Generate 2-3 memory prompts that are:
1. Concise (1-2 sentences max)
2. Action-oriented and specific
3. Contextually relevant to their goals and recent activities
4. Emotionally engaging and reflective

Return ONLY a JSON array of strings, nothing else. Example: ["What small win made you smile today?", "Describe a moment when you felt fully present."]`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse AI response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            return suggestions.slice(0, 3); // Ensure max 3
        }

        // Fallback if parsing fails
        return getFallbackSuggestions();
    } catch (error) {
        console.error("Error generating suggestions:", error);
        return getFallbackSuggestions();
    }
}

function getFallbackSuggestions(): string[] {
    const fallbacks = [
        "What made you smile today? Write about it.",
        "Capture a moment from your day that felt meaningful.",
        "Who inspired you recently? Describe your interaction.",
        "What's one thing you're grateful for right now?",
        "Describe a challenge you overcame today, big or small.",
        "What did you learn today that surprised you?",
    ];

    // Return 3 random fallbacks
    return fallbacks.sort(() => Math.random() - 0.5).slice(0, 3);
}
