"use server";

import { generateContentWithSmartRouter } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getMonthlyHoroscope, getZodiacSign } from "@/lib/horoscope";
import { calculateFinancialHealthScore } from "@/lib/finance";
import { createCalendarEvent, calculateDueDate } from "@/lib/google-calendar";
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
 * Caches recommendations to DB and only regenerates when forced
 */
export async function generateAIRecommendations(userId: string, forceRefresh: boolean = false) {
    try {
        // Check for cached recommendations first (unless force refresh)
        if (!forceRefresh) {
            const cachedRecs = await prisma.aIRecommendation.findMany({
                where: {
                    userId,
                    type: "personality",
                    status: "pending"
                },
                orderBy: { createdAt: "desc" },
            });

            if (cachedRecs.length > 0) {
                return {
                    success: true,
                    recommendations: cachedRecs.map(r => ({
                        id: r.id,
                        category: r.category,
                        task: r.task,
                        description: r.description,
                    })),
                    cached: true,
                };
            }
        }

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

        // Parse JSON response with better error handling
        let data;
        try {
            const jsonStr = response.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
            // Try to find JSON in the response
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }
            data = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error("Failed to parse AI response:", response);
            // Return fallback recommendations based on personality type
            data = {
                recommendations: [
                    {
                        category: "Personal Development",
                        task: "Set aside 30 minutes daily for self-reflection or journaling",
                        description: "Build self-awareness aligned with your personality type"
                    },
                    {
                        category: "Career",
                        task: "Identify one skill to develop this month and find resources to learn it",
                        description: "Continuous growth leads to career advancement"
                    },
                    {
                        category: "Health",
                        task: "Establish a consistent sleep schedule for the next 30 days",
                        description: "Quality rest improves focus and decision-making"
                    },
                    {
                        category: "Relationships",
                        task: "Reach out to one person you haven't spoken to in a while",
                        description: "Nurturing connections strengthens your social network"
                    }
                ]
            };
        }

        if (!data.recommendations || !Array.isArray(data.recommendations)) {
            throw new Error("Invalid recommendations format");
        }

        // Clear old pending recommendations before saving new ones
        await prisma.aIRecommendation.deleteMany({
            where: { userId, type: "personality", status: "pending" },
        });

        // Save recommendations to DB
        const savedRecs = await Promise.all(
            data.recommendations.map((rec: any) =>
                prisma.aIRecommendation.create({
                    data: {
                        userId,
                        type: "personality",
                        category: rec.category,
                        task: rec.task,
                        description: rec.description,
                        status: "pending",
                    },
                })
            )
        );

        // Update generation timestamp
        await prisma.userPreferences.upsert({
            where: { userId },
            create: { userId, personalityRecsGeneratedAt: new Date() },
            update: { personalityRecsGeneratedAt: new Date() },
        });

        revalidatePath("/compass");
        return {
            success: true,
            recommendations: savedRecs.map(r => ({
                id: r.id,
                category: r.category,
                task: r.task,
                description: r.description,
            })),
            cached: false,
        };
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
 * Accept a recommendation and create multiple atomic CompassTodos
 * AI breaks down the goal into practical steps across timeframes
 */
export async function acceptRecommendation(
    userId: string,
    recommendation: {
        id?: string; // AIRecommendation ID if from cache
        category: string;
        task: string;
        description?: string;
    }
) {
    try {
        // Use AI to break down into atomic todos across timeframes
        const prompt = `
You are a productivity coach. Break down this goal into practical, atomic action items.

**Goal:** "${recommendation.task}"
**Context:** "${recommendation.description || "No additional context"}"
**Category:** ${recommendation.category}

**Task:**
Create 3-6 specific, actionable tasks that will help achieve this goal.
Distribute them across different timeframes based on urgency and sequence:
- "today": Quick wins, immediate actions (under 2 hours each)
- "week": Medium-term actions (need a few days)
- "month": Longer-term or ongoing commitments

Each task should be:
- Specific and measurable
- Completable independently
- Clear on what "done" looks like

Return ONLY valid JSON:
{
  "todos": [
    {
      "task": "Specific action item",
      "description": "Brief context on how to do it",
      "timeframe": "today" | "week" | "month"
    },
    ...
  ]
}
`;

        const response = await generateContentWithSmartRouter(prompt, "smart");
        const jsonStr = response.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        const data = JSON.parse(jsonStr);

        if (!data.todos || !Array.isArray(data.todos)) {
            throw new Error("Invalid AI response format");
        }

        // Create all the todos
        const createdTodos = await Promise.all(
            data.todos.map(async (item: any) => {
                return prisma.compassTodo.create({
                    data: {
                        userId,
                        task: item.task,
                        description: item.description,
                        category: recommendation.category,
                        timeframe: item.timeframe || "week",
                        status: "pending",
                        source: "ai",
                    },
                });
            })
        );

        // Mark the recommendation as accepted if it has an ID
        if (recommendation.id) {
            await prisma.aIRecommendation.update({
                where: { id: recommendation.id },
                data: { status: "accepted" },
            });
        }

        revalidatePath("/compass");
        return {
            success: true,
            todos: createdTodos,
            count: createdTodos.length
        };
    } catch (error: any) {
        console.error("Error accepting recommendation:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Dismiss a recommendation (marks as dismissed in DB)
 */
export async function dismissRecommendation(recommendationId: string) {
    try {
        await prisma.aIRecommendation.update({
            where: { id: recommendationId },
            data: { status: "dismissed" },
        });

        revalidatePath("/compass");
        return { success: true };
    } catch (error: any) {
        console.error("Error dismissing recommendation:", error);
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

/**
 * Save financial snapshot to database
 */
export async function saveFinancialSnapshot(
    userId: string,
    financialData: {
        debt: number;
        liabilities: number;
        assets: number;
        cash: number;
        stocks?: any[];
        investments?: any[];
    }
) {
    try {
        const snapshot = await prisma.financialSnapshot.create({
            data: {
                userId,
                dataJson: financialData,
            },
        });

        revalidatePath("/compass");
        return { success: true, snapshot };
    } catch (error: any) {
        console.error("Error saving financial snapshot:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate AI financial analysis
 */
export async function generateFinancialAnalysis(userId: string) {
    try {
        const snapshot = await prisma.financialSnapshot.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        if (!snapshot) {
            return {
                success: false,
                error: "No financial data found. Please update your financials first.",
            };
        }

        const data = snapshot.dataJson as any;
        const healthScore = calculateFinancialHealthScore({
            debt: data.debt || 0,
            liabilities: data.liabilities || 0,
            assets: data.assets || 0,
            cash: data.cash || 0,
        });

        const prompt = `You are a financial advisor AI. Analyze this financial snapshot and provide advice.

**Financial Data:**
- Debt: $${data.debt || 0}
- Liabilities: $${data.liabilities || 0}
- Assets: $${data.assets || 0}
- Cash on Hand: $${data.cash || 0}
- Net Worth: $${(data.assets || 0) + (data.cash || 0) - (data.debt || 0) - (data.liabilities || 0)}

**Health Score:** ${healthScore}/100

Provide 5-7 specific, actionable financial recommendations.
Return ONLY valid JSON:
{
  "summary": "A brief 2-3 sentence overview",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...]
}`;

        const response = await generateContentWithSmartRouter(prompt, "smart");
        const jsonStr = response.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        const aiResult = JSON.parse(jsonStr);

        await prisma.financialSnapshot.update({
            where: { id: snapshot.id },
            data: {
                healthScore,
                aiReport: aiResult.summary,
                recommendations: aiResult.recommendations,
            },
        });

        revalidatePath("/compass");
        return {
            success: true,
            healthScore,
            summary: aiResult.summary,
            recommendations: aiResult.recommendations,
        };
    } catch (error: any) {
        console.error("Error generating financial analysis:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get latest financial snapshot
 */
export async function getLatestFinancialSnapshot(userId: string) {
    try {
        const snapshot = await prisma.financialSnapshot.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, snapshot };
    } catch (error: any) {
        console.error("Error fetching financial snapshot:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update investment preference
 */
export async function updateInvestmentPreference(userId: string, monthlyInvestment: number) {
    try {
        let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
        if (!prefs) {
            prefs = await prisma.userPreferences.create({ data: { userId, monthlyInvestment } });
        } else {
            prefs = await prisma.userPreferences.update({ where: { userId }, data: { monthlyInvestment } });
        }
        revalidatePath("/compass");
        return { success: true, preferences: prefs };
    } catch (error: any) {
        console.error("Error updating investment preference:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
    try {
        let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
        if (!prefs) {
            prefs = await prisma.userPreferences.create({ data: { userId } });
        }
        return { success: true, preferences: prefs };
    } catch (error: any) {
        console.error("Error fetching user preferences:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user has Google Calendar connected
 */
export async function isCalendarConnected(userId: string) {
    try {
        const prefs = await prisma.userPreferences.findUnique({
            where: { userId },
            select: {
                googleCalendarEnabled: true,
                googleAccessToken: true,
                googleRefreshToken: true,
            }
        });

        const isConnected = !!(
            prefs?.googleCalendarEnabled &&
            prefs?.googleAccessToken &&
            prefs?.googleRefreshToken
        );

        return { success: true, isConnected };
    } catch (error: any) {
        console.error("Error checking calendar connection:", error);
        return { success: false, isConnected: false, error: error.message };
    }
}

/**
 * Add a todo to Google Calendar
 */
export async function addTodoToCalendar(todoId: string) {
    try {
        // Get the todo
        const todo = await prisma.compassTodo.findUnique({
            where: { id: todoId },
            include: { user: true },
        });

        if (!todo) {
            return { success: false, error: "Todo not found" };
        }

        // Get user's calendar tokens
        const prefs = await prisma.userPreferences.findUnique({
            where: { userId: todo.userId },
        });

        if (!prefs?.googleCalendarEnabled || !prefs.googleAccessToken || !prefs.googleRefreshToken) {
            return { success: false, error: "Google Calendar not connected. Please connect in Settings." };
        }

        // Calculate due date based on timeframe
        const dueDate = calculateDueDate(todo.timeframe);

        // Create calendar event
        const event = await createCalendarEvent(
            prefs.googleAccessToken,
            prefs.googleRefreshToken,
            {
                summary: `📋 ${todo.task}`,
                description: `${todo.description || ''}\n\nCategory: ${todo.category}\nFrom: 2moro Compass`,
                startDate: dueDate,
                allDay: true,
            }
        );

        // Update todo with Google event ID
        await prisma.compassTodo.update({
            where: { id: todoId },
            data: { googleEventId: event.id },
        });

        revalidatePath("/compass");
        return { success: true, eventId: event.id };
    } catch (error: any) {
        console.error("Error adding todo to calendar:", error);

        // Handle token expiration
        if (error.message?.includes('invalid_grant') || error.message?.includes('Token')) {
            return {
                success: false,
                error: "Calendar connection expired. Please reconnect in Settings."
            };
        }

        return { success: false, error: error.message };
    }
}

/**
 * Add multiple todos to calendar at once
 */
export async function addMultipleTodosToCalendar(todoIds: string[]) {
    const results = await Promise.all(
        todoIds.map(id => addTodoToCalendar(id))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
        success: failed === 0,
        message: `Added ${successful} task${successful !== 1 ? 's' : ''} to calendar${failed > 0 ? `, ${failed} failed` : ''}`,
        results,
    };
}
