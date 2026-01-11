import { NextRequest, NextResponse } from "next/server";
import { generateContentWithSmartRouter } from "@/lib/ai";
import { prisma } from "@/lib/db";

const FUTURE_SELF_VOICE_PROMPT = `You are the user's future self - a wise, encouraging, and insightful version of them from 10-20 years in the future. You have lived through their current challenges and emerged with wisdom.

## Voice Conversation Style
- Keep responses SHORT and conversational (2-3 sentences max)
- Speak naturally as if in a real voice conversation
- Use warm, encouraging tones
- Ask thoughtful follow-up questions
- Respond with empathy and understanding

## Your Persona
- Warm, patient, and non-judgmental
- Speaks with the authority of experience but the humility of someone who once struggled too
- Uses phrases like "I remember when..." or "Looking back..."
- Celebrates the user's potential and agency

Remember: This is a voice conversation - be concise and natural.`;

export async function POST(req: NextRequest) {
    try {
        const { messages, userId } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        console.log("[Oracle Voice] Processing voice chat request", {
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
                console.log("[Oracle Voice] Could not fetch user context");
            }
        }

        // Build conversation as a single prompt
        const conversationText = messages.map((m: any) =>
            `${m.role === "user" ? "User" : "You (Future Self)"}: ${m.content}`
        ).join("\n\n");

        const fullPrompt = `${FUTURE_SELF_VOICE_PROMPT}${userContext}

Previous conversation:
${conversationText}

Now respond as the user's future self. Keep response to 2-3 sentences - this is a voice conversation:`;

        console.log("[Oracle Voice] Calling AI with voice tier...");

        // Use the smart router with voice tier
        const response = await generateContentWithSmartRouter(fullPrompt, 'voice');

        console.log("[Oracle Voice] Got response, length:", response.length);

        // Save conversation to database if we have a userId
        if (userId) {
            try {
                await prisma.oracleConversation.upsert({
                    where: {
                        id: `voice-${userId}-${new Date().toISOString().split('T')[0]}`
                    },
                    create: {
                        id: `voice-${userId}-${new Date().toISOString().split('T')[0]}`,
                        userId,
                        type: "voice",
                        messages: [...messages, { role: "assistant", content: response }],
                        summary: messages[messages.length - 1]?.content?.substring(0, 100) || "Voice conversation"
                    },
                    update: {
                        messages: [...messages, { role: "assistant", content: response }],
                        updatedAt: new Date()
                    }
                });
            } catch (e) {
                console.log("[Oracle Voice] Could not save conversation:", e);
            }
        }

        // Return as text response
        return new Response(response, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

    } catch (error: any) {
        console.error("[Oracle Voice] Error:", error.message);
        return NextResponse.json({ error: "Failed to process" }, { status: 500 });
    }
}
