import { NextRequest } from "next/server";
import { generateTTS } from "@/lib/elevenlabs";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST /api/oracle/speak
 * Converts text to speech using ElevenLabs
 * Returns MP3 audio buffer
 */
export async function POST(req: NextRequest) {
    try {
        // Authenticate request
        const session = await auth();
        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const { text } = await req.json();

        if (!text) {
            return new Response(JSON.stringify({ error: "Missing text" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log("[Oracle/Speak] Generating TTS for:", text.substring(0, 100) + "...");

        const audioBuffer = await generateTTS(text);

        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.length.toString()
            }
        });

    } catch (error: any) {
        console.error("[Oracle/Speak] Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
