import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// Use the correct API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);

// The model for Oracle voice conversations with fallbacks
const VOICE_MODELS = [
    "gemini-2.5-flash",        // Primary
    "gemini-2.0-flash-exp",    // Fallback 1
    "gemini-1.5-flash-latest", // Fallback 2
];

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

// Try models in order until one works
async function generateWithFallback(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (const modelName of VOICE_MODELS) {
        try {
            console.log(`[Oracle Voice] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            if (response) {
                console.log(`[Oracle Voice] Success with model: ${modelName}`);
                return response;
            }
        } catch (error: any) {
            console.warn(`[Oracle Voice] Model ${modelName} failed:`, error.message?.substring(0, 100));
            lastError = error;
            // Continue to next model
        }
    }

    throw lastError || new Error("All models failed");
}

export async function POST(req: NextRequest) {
    try {
        // Authenticate request
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { messages } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        console.log("[Oracle Voice] Processing voice chat request", {
            messageCount: messages.length,
            userId
        });

        // Fetch user context
        let userContext = "";
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

        // Build conversation as a single prompt
        const conversationText = messages.map((m: any) =>
            `${m.role === "user" ? "User" : "You (Future Self)"}: ${m.content}`
        ).join("\n\n");

        const fullPrompt = `${FUTURE_SELF_VOICE_PROMPT}${userContext}

Previous conversation:
${conversationText}

Now respond as the user's future self. Keep response to 2-3 sentences - this is a voice conversation:`;

        // Use fallback logic
        const response = await generateWithFallback(fullPrompt);

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
        return new Response("I apologize, I couldn't connect right now. Please try again.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
    }
}

