import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // Authenticate request
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // Rate limiting: Check if suggestions were generated in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentSuggestions = await prisma.memorySuggestion.findFirst({
            where: {
                userId,
                generatedAt: { gt: fiveMinutesAgo },
            },
            orderBy: { generatedAt: "desc" },
        });

        if (recentSuggestions) {
            return NextResponse.json(
                {
                    error: "Please wait before generating new suggestions",
                    retryAfter: new Date(recentSuggestions.generatedAt.getTime() + 5 * 60 * 1000),
                },
                { status: 429 }
            );
        }

        // Delete old suggestions for this user
        await prisma.memorySuggestion.deleteMany({
            where: { userId },
        });

        // Trigger regeneration by making internal request
        const baseUrl = req.nextUrl.origin;
        const response = await fetch(`${baseUrl}/api/suggestions/daily`, {
            headers: {
                cookie: req.headers.get("cookie") || "",
            },
        });

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
