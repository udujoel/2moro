import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const apiKey = process.env.GEMINI_KEY;

    if (!apiKey) {
        console.error("[Oracle] Missing GEMINI_KEY");
        return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    try {
        const { messages, userId } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

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

        const genAI = new GoogleGenerativeAI(apiKey);

        // Build conversation as a single prompt for reliability
        const conversationText = messages.map((m: any) =>
            `${m.role === "user" ? "User" : "You (Future Self)"}: ${m.content}`
        ).join("\n\n");

        const fullPrompt = `${FUTURE_SELF_SYSTEM_PROMPT}${userContext}

Previous conversation:
${conversationText}

Now respond as the user's future self:`;

        // Try models with fallback
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-pro",
            "gemini-1.5-pro",
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Oracle] Trying ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContentStream(fullPrompt);

                const encoder = new TextEncoder();
                const stream = new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of result.stream) {
                                const text = chunk.text();
                                if (text) {
                                    controller.enqueue(encoder.encode(text));
                                }
                            }
                            controller.close();
                        } catch (err) {
                            console.error("[Oracle] Stream error:", err);
                            controller.close();
                        }
                    },
                });

                console.log(`[Oracle] Success with ${modelName}`);
                return new Response(stream, {
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            } catch (error: any) {
                console.warn(`[Oracle] ${modelName} failed:`, error.message?.substring(0, 100));
                continue;
            }
        }

        return NextResponse.json({ error: "AI temporarily unavailable" }, { status: 503 });

    } catch (error: any) {
        console.error("[Oracle] Error:", error.message);
        return NextResponse.json({ error: "Failed to process" }, { status: 500 });
    }
}
