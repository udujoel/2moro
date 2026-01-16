import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        // Authenticate request
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // Fetch recent conversations
        const conversations = await prisma.oracleConversation.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                type: true,
                summary: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            conversations: conversations.map(c => ({
                id: c.id,
                type: c.type,
                summary: c.summary || "Untitled conversation",
                createdAt: c.createdAt,
            })),
        });
    } catch (error) {
        console.error("[Oracle Recent] Error:", error);
        return NextResponse.json({ conversations: [] });
    }
}
