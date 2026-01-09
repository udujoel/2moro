import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// News API for regional news (using NewsData.io or similar free API)
async function fetchRegionalNews(location?: string): Promise<string[]> {
    try {
        // Use a free news API - NewsAPI.org free tier
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) return [];

        const query = location || "world";
        const res = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!res.ok) return [];

        const data = await res.json();
        return data.articles?.slice(0, 5).map((a: any) => a.title) || [];
    } catch {
        return [];
    }
}

export async function GET(req: NextRequest) {
    try {
        // For demo purposes, generate suggestions using available context
        // In production, implement proper authentication

        // Try to find any user to get their data
        const user = await prisma.user.findFirst({
            include: {
                userPreferences: true,
            }
        });

        if (!user) {
            // Return contextual fallback suggestions
            return NextResponse.json({
                suggestions: getSmartFallbacks(),
                generatedAt: new Date(),
                canRegenerate: true,
            });
        }

        // Check for existing valid suggestions (not expired)
        const now = new Date();
        const existingSuggestions = await prisma.memorySuggestion.findMany({
            where: {
                userId: user.id,
                expiresAt: { gt: now },
            },
            orderBy: { generatedAt: "desc" },
            take: 6,
        });

        if (existingSuggestions.length > 0) {
            return NextResponse.json({
                suggestions: existingSuggestions.map((s) => s.content),
                generatedAt: existingSuggestions[0].generatedAt,
                canRegenerate: true,
            });
        }

        // Generate new contextual suggestions
        const suggestions = await generateContextualSuggestions(user.id);

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
        return NextResponse.json({
            suggestions: getSmartFallbacks(),
            generatedAt: new Date(),
            canRegenerate: true,
        });
    }
}

async function generateContextualSuggestions(userId: string): Promise<string[]> {
    try {
        // Fetch comprehensive user context data
        const [compassTodos, recentMemories, calendarEvents, userPrefs] = await Promise.all([
            // Compass action items
            prisma.compassTodo.findMany({
                where: {
                    userId,
                    status: "pending",
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            // Recent memories for theme continuity
            prisma.memory.findMany({
                where: { userId },
                orderBy: { memoryDate: "desc" },
                take: 5,
                include: { people: true },
            }),
            // Get calendar events if connected
            prisma.compassTodo.findMany({
                where: {
                    userId,
                    source: "calendar",
                    dueDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
                    },
                },
            }),
            // User preferences for location
            prisma.userPreferences.findUnique({
                where: { userId },
            }),
        ]);

        // Get regional news headlines
        const newsHeadlines = await fetchRegionalNews();

        // Build detailed context
        const context = {
            date: new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            timeOfDay: getTimeOfDay(),

            // Compass goals grouped by category
            goals: compassTodos.map((t) => ({
                task: t.task,
                category: t.category,
                description: t.description,
            })),

            // Upcoming calendar events
            upcomingEvents: calendarEvents.map((e) => ({
                title: e.task,
                date: e.dueDate?.toLocaleDateString(),
            })),

            // Recent memory themes and people
            recentThemes: recentMemories.map((m) => ({
                title: m.title,
                content: m.content.substring(0, 100),
                people: m.people.map(p => p.name),
                weather: m.weather,
            })),

            // News headlines for current events
            news: newsHeadlines,
        };

        const prompt = `You are a smart memory journal assistant. Generate exactly 3 SHORT memory entry suggestions (max 5 words each) based on the user's actual context.

TODAY: ${context.date} (${context.timeOfDay})

USER'S ACTIVE GOALS & TODOS:
${context.goals.length > 0 ? context.goals.map(g => `- ${g.task} (${g.category})`).join('\n') : 'None'}

UPCOMING CALENDAR EVENTS:
${context.upcomingEvents.length > 0 ? context.upcomingEvents.map(e => `- ${e.title} on ${e.date}`).join('\n') : 'None'}

RECENT MEMORY THEMES:
${context.recentThemes.length > 0 ? context.recentThemes.map(t => `- "${t.title || t.content}"`).join('\n') : 'None'}

CURRENT NEWS HEADLINES:
${context.news.length > 0 ? context.news.map(n => `- ${n}`).join('\n') : 'None'}

RULES:
1. Each suggestion must be a SHORT phrase (2-5 words max), NOT a question
2. Suggestions should be specific memory entry TITLES, like: "Morning run in the park", "Birthday party prep", "First day at new gym"
3. Base suggestions on REAL data above - if there's a fitness goal, suggest "Evening jog today" or "Gym session notes"
4. If there's a calendar event, suggest a memory title about it like "Meeting with Sarah"
5. If there's interesting news, suggest documenting reaction like "Market crash thoughts"
6. Make them feel like natural diary entry titles, not prompts

Return ONLY a JSON array with exactly 6 strings. Example: ["Morning yoga session", "Coffee with James", "Project deadline push", "Lunch at cafe", "Evening walk", "Day's highlight"]`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse AI response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            // Truncate any overly long suggestions
            return suggestions.slice(0, 6).map((s: string) =>
                s.length > 40 ? s.substring(0, 37) + "..." : s
            );
        }

        return getSmartFallbacks();
    } catch (error) {
        console.error("Error generating contextual suggestions:", error);
        return getSmartFallbacks();
    }
}

function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
}

function getSmartFallbacks(): string[] {
    const timeOfDay = getTimeOfDay();
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const contextualFallbacks: Record<string, string[]> = {
        morning: [
            "Morning reflection",
            "Today's intentions",
            "Breakfast thoughts",
            "Early walk notes",
            "Morning gratitude",
            "Sunrise moments",
        ],
        afternoon: [
            "Midday check-in",
            "Lunch break notes",
            "Afternoon productivity",
            "Work milestone",
            "Creative spark",
            "Energy boost",
        ],
        evening: [
            "Evening wind-down",
            "Dinner conversations",
            "Day's highlights",
            "Sunset walk",
            "Family time",
            "Relaxation notes",
        ],
        night: [
            "Late night thoughts",
            "Day recap",
            "Tomorrow's plans",
            "Quiet reflections",
            "Sleep prep",
            "Night gratitude",
        ],
    };

    return contextualFallbacks[timeOfDay] || contextualFallbacks.afternoon;
}
