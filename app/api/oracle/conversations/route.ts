import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/oracle/conversations
 * Fetch recent Oracle conversations for authenticated user
 */
export async function GET(req: NextRequest) {
    // Authenticate request
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const conversations = await prisma.oracleConversation.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                id: true,
                type: true,
                summary: true,
                createdAt: true,
                messages: true,
            }
        });

        return NextResponse.json({ conversations });
    } catch (error: any) {
        console.error("[Oracle/Conversations] Error fetching:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/oracle/conversations
 * Save an Oracle conversation for authenticated user
 */
export async function POST(req: NextRequest) {
    try {
        // Authenticate request
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { type, messages, summary } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate summary from first user message if not provided
        const autoSummary = summary ||
            messages.find((m: any) => m.role === "user")?.content?.slice(0, 100) ||
            "Conversation with Future Self";

        const conversation = await prisma.oracleConversation.create({
            data: {
                userId,
                type: type || "text",
                messages: messages,
                summary: autoSummary,
            }
        });

        return NextResponse.json({
            success: true,
            conversationId: conversation.id
        });
    } catch (error: any) {
        console.error("[Oracle/Conversations] Error saving:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
