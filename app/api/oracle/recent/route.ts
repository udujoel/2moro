import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        // Get user from cookies or search params
        const cookieStore = await cookies();
        let userId = cookieStore.get("userId")?.value;

        if (!userId) {
            userId = req.nextUrl.searchParams.get("userId") || undefined;
        }

        if (!userId) {
            return NextResponse.json({ conversations: [] });
        }

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
