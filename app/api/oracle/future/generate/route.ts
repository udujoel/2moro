import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateContentWithFallback } from "@/lib/ai";

interface LifePathCategory {
    category: string;
    icon: string;
    current: string;
    projection: string;
    score: number; // 1-10
}

interface Scenario {
    type: "optimistic" | "current" | "warning";
    title: string;
    description: string;
    lifePaths: LifePathCategory[];
    narrative: string;
}

/**
 * POST /api/oracle/future/generate
 * Generate full future visualization with 3 scenarios
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, yearsAhead = 20 } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Fetch comprehensive user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                memories: {
                    take: 30,
                    orderBy: { createdAt: "desc" },
                    select: { content: true, title: true, memoryDate: true }
                },
                personalityTests: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
                habits: {
                    select: { title: true, frequency: true, streak: true }
                },
                financialSnapshots: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
                compassTodos: {
                    where: { status: "pending" },
                    take: 15,
                    select: { task: true, category: true, timeframe: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Build data context
        const personality = user.personalityTests[0];
        const financial = user.financialSnapshots[0];
        const habitsContext = user.habits.map(h => `${h.title} (${h.frequency}, streak: ${h.streak})`).join(", ");
        const goalsContext = user.compassTodos.map(t => `${t.category}: ${t.task}`).join("\n");
        const memoriesContext = user.memories.slice(0, 10).map(m => m.content?.slice(0, 80)).join("\n");

        // Generate 3 scenarios with life path breakdowns
        const scenariosPrompt = `You are an AI oracle generating 3 future life scenarios for ${user.name || "this person"} ${yearsAhead} years from now.

USER DATA:
- Personality: ${personality?.mbtiType || "Growth-oriented individual"}${personality?.description ? ` - ${personality.description.slice(0, 150)}` : ""}
- Habits: ${habitsContext || "Building positive routines"}
- Financial Health Score: ${financial?.healthScore || "Unknown"}/100
- Goals: ${goalsContext || "Working toward personal fulfillment"}
- Recent Life Events: ${memoriesContext || "Various meaningful experiences"}

Generate exactly 3 scenarios in this JSON format:
{
  "scenarios": [
    {
      "type": "optimistic",
      "title": "The Best Version of You",
      "description": "A 2-sentence description of this bright future",
      "lifePaths": [
        {"category": "Finances", "icon": "💰", "current": "Current financial habits summary", "projection": "Where finances will be in ${yearsAhead} years", "score": 9},
        {"category": "Health", "icon": "❤️", "current": "Current health patterns", "projection": "Health projection", "score": 8},
        {"category": "Fitness", "icon": "💪", "current": "Current fitness level", "projection": "Fitness projection", "score": 8},
        {"category": "Career", "icon": "💼", "current": "Current career path", "projection": "Career achievement", "score": 9},
        {"category": "Relationships", "icon": "👥", "current": "Current relationship status", "projection": "Relationship quality", "score": 9},
        {"category": "Social", "icon": "🌐", "current": "Current social engagement", "projection": "Social fulfillment", "score": 8}
      ],
      "narrative": "A 150-word vivid description of a typical day in this optimistic future, written in second person"
    },
    {
      "type": "current",
      "title": "Your Current Trajectory",
      "description": "A 2-sentence realistic projection",
      "lifePaths": [...similar structure with scores 5-7...],
      "narrative": "150-word description of current trajectory future"
    },
    {
      "type": "warning",
      "title": "The Wake-Up Call",
      "description": "A 2-sentence gentle warning",
      "lifePaths": [...similar structure with scores 3-5...],
      "narrative": "150-word description of what to avoid"
    }
  ],
  "wisdomContent": "A 100-word inspirational message about the power of choice and small daily actions"
}

Respond ONLY with valid JSON, no markdown or explanation.`;

        const scenariosResponse = await generateContentWithFallback(scenariosPrompt);

        // Parse the JSON response
        let parsedScenarios;
        try {
            // Clean up potential markdown code blocks
            const cleanJson = scenariosResponse
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            parsedScenarios = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("[Future/Generate] JSON parse error:", parseError);
            return NextResponse.json({
                error: "Failed to parse AI response"
            }, { status: 500 });
        }

        // Save to database
        const visualization = await prisma.futureVisualization.create({
            data: {
                userId,
                scenarios: parsedScenarios.scenarios,
                wisdomContent: parsedScenarios.wisdomContent,
                dataSnapshot: {
                    personality: personality?.mbtiType,
                    habitsCount: user.habits.length,
                    financialScore: financial?.healthScore,
                    goalsCount: user.compassTodos.length,
                    generatedAt: new Date().toISOString(),
                    yearsAhead
                }
            }
        });

        return NextResponse.json({
            success: true,
            id: visualization.id,
            scenarios: parsedScenarios.scenarios,
            wisdomContent: parsedScenarios.wisdomContent,
            createdAt: visualization.createdAt
        });

    } catch (error: any) {
        console.error("[Future/Generate] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/oracle/future/generate
 * Fetch the most recent visualization for a user
 */
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const visualization = await prisma.futureVisualization.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        if (!visualization) {
            return NextResponse.json({ exists: false });
        }

        return NextResponse.json({
            exists: true,
            id: visualization.id,
            scenarios: visualization.scenarios,
            wisdomContent: visualization.wisdomContent,
            createdAt: visualization.createdAt
        });

    } catch (error: any) {
        console.error("[Future/Generate] GET Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
