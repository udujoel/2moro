import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/oracle/conversations/[id]
 * Fetch a specific Oracle conversation with full transcript
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Authenticate request
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
    }

    try {
        const conversation = await prisma.oracleConversation.findUnique({
            where: { id },
            select: {
                id: true,
                type: true,
                summary: true,
                messages: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json({ conversation });
    } catch (error: any) {
        console.error("[Oracle/Conversation] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
