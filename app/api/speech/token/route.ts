import { NextResponse } from "next/server";

/**
 * GET /api/speech/token
 * 
 * Generate a temporary AssemblyAI token for browser-side streaming transcription.
 * This keeps the API key secure on the server while allowing client WebSocket connections.
 */
export async function GET() {
    const apiKey = process.env.ASSEMBLYAI_API;

    if (!apiKey) {
        console.error("[Speech Token] ASSEMBLYAI_API not configured");
        return NextResponse.json(
            { error: "Speech service not configured" },
            { status: 500 }
        );
    }

    try {
        // Request a temporary token from AssemblyAI v3 Universal Streaming
        // Token expires in 5 minutes (300 seconds)
        const response = await fetch(`https://streaming.assemblyai.com/v3/token?expires_in_seconds=300`, {
            method: "GET",
            headers: {
                "Authorization": apiKey,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("[Speech Token] AssemblyAI error:", error);
            return NextResponse.json(
                { error: "Failed to get speech token" },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log("[Speech Token] Generated temporary token");

        return NextResponse.json({ token: data.token });

    } catch (error: any) {
        console.error("[Speech Token] Error:", error.message);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}
