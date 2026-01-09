import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        // Simple user ID extraction
        const userId = req.cookies.get("userId")?.value;

        if (!userId) {
            const fallbackSuggestions = [
                "What made you smile today?",
                "Capture a meaningful moment from your day.",
                "Who inspired you recently?"
            ];
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

        // Rate limiting: Check if suggestions were generated in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentSuggestions = await prisma.memorySuggestion.findFirst({
            where: {
                userId: user.id,
                generatedAt: { gt: oneHourAgo },
            },
            orderBy: { generatedAt: "desc" },
        });

        if (recentSuggestions) {
            return NextResponse.json(
                {
                    error: "Please wait before generating new suggestions",
                    retryAfter: new Date(recentSuggestions.generatedAt.getTime() + 60 * 60 * 1000),
                },
                { status: 429 }
            );
        }

        // Delete old suggestions for this user
        await prisma.memorySuggestion.deleteMany({
            where: { userId: user.id },
        });

        // Trigger regeneration by redirecting to daily endpoint
        const response = await fetch(
            `${req.nextUrl.origin}/api/suggestions/daily`,
            {
                headers: {
                    cookie: req.headers.get("cookie") || "",
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error regenerating suggestions:", error);
        return NextResponse.json(
            { error: "Failed to regenerate suggestions" },
            { status: 500 }
        );
    }
}
