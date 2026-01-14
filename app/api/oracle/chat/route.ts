import { NextRequest, NextResponse } from "next/server";
import { generateContentWithSmartRouter } from "@/lib/ai";
import { prisma } from "@/lib/db";

const FUTURE_SELF_SYSTEM_PROMPT = `You are the user's future self - a wise, encouraging, and insightful version of them from 10-20 years in the future. You have lived through their current challenges and emerged with wisdom.

## Your Persona
- Warm, patient, and non-judgmental
- Speaks with the authority of experience but the humility of someone who once struggled too
- Uses phrases like "When I look back at this moment..." or "I remember when I was figuring this out..."
- Celebrates the user's potential and agency

## Your Methodology: Socratic Questioning
- NEVER give direct advice or answers
- Instead, ask thoughtful questions that guide the user toward their own insights
- Use reflective questions like:
  - "What do you think would happen if..."
  - "What's really at the heart of this for you?"
  - "If you could fast-forward 5 years, what would you wish you had understood today?"

## Response Style
- Keep responses conversational and brief (2-3 paragraphs)
- Acknowledge emotions before exploring solutions
- End most responses with a thoughtful question

Remember: You ARE their future self speaking with intimate knowledge and care.`;

export async function POST(req: NextRequest) {
    try {
        const { messages, userId } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        console.log("[Oracle] Processing chat request", {
            messageCount: messages.length,
            userId: userId || "anonymous"
        });

        // Fetch user context
        let userContext = "";
        if (userId) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { name: true }
                });
                if (user) {
                    userContext = `\n\nUser's name: ${user.name}`;
                }
            } catch (e) {
                console.log("[Oracle] Could not fetch user context");
            }
        }

        // Build conversation as a single prompt
        const conversationText = messages.map((m: any) =>
            `${m.role === "user" ? "User" : "You (Future Self)"}: ${m.content}`
        ).join("\n\n");

        const fullPrompt = `${FUTURE_SELF_SYSTEM_PROMPT}${userContext}

Previous conversation:
${conversationText}

Now respond as the user's future self. Be warm, wise, and use Socratic questioning. Keep your response to 2-3 paragraphs:`;

        console.log("[Oracle] Calling AI with smart router...");

        // Use the proven smart router from lib/ai.ts
        const responseText = await generateContentWithSmartRouter(fullPrompt, 'smart');

        console.log("[Oracle] Got response, length:", responseText.length);

        // PERSISTENCE: Save conversation to database
        if (userId) {
            try {
                // Find recent active conversation (last 30 mins) to append to
                const recentConv = await prisma.oracleConversation.findFirst({
                    where: {
                        userId,
                        updatedAt: { gt: new Date(Date.now() - 30 * 60 * 1000) }
                    },
                    orderBy: { updatedAt: "desc" }
                });

                const newMessages = [
                    ...messages,
                    { role: "assistant", content: responseText, timestamp: new Date().toISOString() }
                ];

                if (recentConv) {
                    await prisma.oracleConversation.update({
                        where: { id: recentConv.id },
                        data: { messages: newMessages }
                    });
                } else {
                    await prisma.oracleConversation.create({
                        data: {
                            userId,
                            messages: newMessages,
                            summary: messages[0]?.content?.slice(0, 50) || "New conversation"
                        }
                    });
                }
            } catch (dbError) {
                console.error("[Oracle] Failed to persist conversation:", dbError);
            }
        }

        // Return as streaming-compatible text response
        return new Response(responseText, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

    } catch (error: any) {
        console.error("[Oracle] Error:", error.message);
        return NextResponse.json({ error: "Failed to process" }, { status: 500 });
    }
}
