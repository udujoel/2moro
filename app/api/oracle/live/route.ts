import { NextRequest } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the Gemini AI client with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

// Model configuration for native audio dialog
// Using official model from Google AI documentation
const MODEL_NAME = "gemini-2.5-flash-native-audio-preview-12-2025";
const SYSTEM_INSTRUCTION = `You are the user's future self - a wise, encouraging, and insightful version of them from 10-20 years in the future. You have lived through their current challenges and emerged with wisdom.

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

// WebSocket handler for real-time audio streaming
export async function GET(req: NextRequest) {
    // Check if this is a WebSocket upgrade request
    const upgradeHeader = req.headers.get("upgrade");
    if (upgradeHeader !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
    }

    // Get the WebSocket from the request
    // Note: This requires Next.js 14+ with experimental WebSocket support
    // or a custom server setup
    const { socket, response } = (Reflect.get(req, 'socket') as any) || {};

    if (!socket) {
        // Fallback: Return instructions for WebSocket setup
        return new Response(JSON.stringify({
            error: "WebSocket not available",
            message: "This endpoint requires WebSocket connection. Use the streaming endpoint instead.",
            model: MODEL_NAME,
            config: {
                inputFormat: "audio/pcm;rate=16000",
                outputFormat: "audio/pcm;rate=24000"
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // Connect to Gemini Live API
        const session = await ai.live.connect({
            model: MODEL_NAME,
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: SYSTEM_INSTRUCTION,
            },
            callbacks: {
                onopen: () => {
                    console.log("[Gemini Live] Connected to Gemini Live API");
                    socket.send(JSON.stringify({ type: "connected" }));
                },
                onmessage: (message: any) => {
                    // Forward Gemini's response to the client
                    if (message.serverContent?.modelTurn?.parts) {
                        for (const part of message.serverContent.modelTurn.parts) {
                            if (part.inlineData?.data) {
                                socket.send(JSON.stringify({
                                    type: "audio",
                                    data: part.inlineData.data, // Base64 PCM audio
                                    mimeType: "audio/pcm;rate=24000"
                                }));
                            }
                        }
                    }
                    if (message.serverContent?.interrupted) {
                        socket.send(JSON.stringify({ type: "interrupted" }));
                    }
                },
                onerror: (e: Error) => {
                    console.error("[Gemini Live] Error:", e.message);
                    socket.send(JSON.stringify({ type: "error", message: e.message }));
                },
                onclose: (e: any) => {
                    console.log("[Gemini Live] Closed:", e?.reason || "Unknown");
                    socket.close();
                },
            },
        });

        // Handle incoming messages from client
        socket.on("message", (data: Buffer) => {
            try {
                const message = JSON.parse(data.toString());

                if (message.type === "audio" && message.data) {
                    // Forward audio to Gemini
                    session.sendRealtimeInput({
                        audio: {
                            data: message.data, // Base64 PCM audio
                            mimeType: "audio/pcm;rate=16000"
                        }
                    });
                }
            } catch (e) {
                console.error("[Gemini Live] Error parsing client message:", e);
            }
        });

        socket.on("close", () => {
            console.log("[Gemini Live] Client disconnected");
            session.close();
        });

        return response;
    } catch (error: any) {
        console.error("[Gemini Live] Connection error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// POST endpoint for non-WebSocket environments (SSE streaming)
export async function POST(req: NextRequest) {
    try {
        const { audio, text, sessionId } = await req.json();

        console.log("[Gemini Live] POST request received", { hasAudio: !!audio, hasText: !!text });

        // For non-WebSocket environments, we use a simpler streaming approach
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                let session: any = null;
                let setupComplete = false;
                let inputToSend: { audio?: string; text?: string } | null = { audio, text };
                let controllerClosed = false;

                // Safe enqueue helper
                const safeEnqueue = (data: Uint8Array) => {
                    if (!controllerClosed) {
                        try {
                            controller.enqueue(data);
                        } catch (e) {
                            controllerClosed = true;
                        }
                    }
                };

                const safeClose = () => {
                    if (!controllerClosed) {
                        controllerClosed = true;
                        try {
                            controller.close();
                        } catch (e) {
                            // Already closed
                        }
                    }
                };

                try {
                    console.log("[Gemini Live] Connecting to model:", MODEL_NAME);

                    session = await ai.live.connect({
                        model: MODEL_NAME,
                        config: {
                            responseModalities: [Modality.AUDIO],
                            systemInstruction: SYSTEM_INSTRUCTION,
                        },
                        callbacks: {
                            onopen: () => {
                                console.log("[Gemini Live] Session opened");
                                safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));
                            },
                            onmessage: async (message: any) => {
                                // Log all message types for debugging
                                console.log("[Gemini Live] Message received:", JSON.stringify(message).substring(0, 300));

                                // Handle setup complete - THIS is when we can send input
                                if (message.setupComplete) {
                                    console.log("[Gemini Live] Setup complete, now sending input");
                                    setupComplete = true;

                                    // Now send the input since setup is complete
                                    if (inputToSend && session) {
                                        if (inputToSend.audio) {
                                            console.log("[Gemini Live] Sending audio input...");
                                            await session.sendRealtimeInput({
                                                audio: {
                                                    data: inputToSend.audio,
                                                    mimeType: "audio/pcm;rate=16000"
                                                }
                                            });
                                            console.log("[Gemini Live] Audio sent");
                                        } else if (inputToSend.text) {
                                            console.log("[Gemini Live] Sending text input:", inputToSend.text);
                                            await session.sendClientContent({
                                                turns: [{ role: "user", parts: [{ text: inputToSend.text }] }],
                                                turnComplete: true
                                            });
                                            console.log("[Gemini Live] Text sent, waiting for response...");
                                        }
                                        inputToSend = null;
                                    }
                                    return;
                                }

                                // Handle server content with audio/text
                                if (message.serverContent?.modelTurn?.parts) {
                                    for (const part of message.serverContent.modelTurn.parts) {
                                        if (part.inlineData?.data) {
                                            console.log("[Gemini Live] Got audio chunk, length:", part.inlineData.data.length);
                                            safeEnqueue(encoder.encode(`data: ${JSON.stringify({
                                                type: "audio",
                                                data: part.inlineData.data,
                                                mimeType: "audio/pcm;rate=24000"
                                            })}\n\n`));
                                        }
                                        if (part.text) {
                                            console.log("[Gemini Live] Got text:", part.text.substring(0, 100));
                                            safeEnqueue(encoder.encode(`data: ${JSON.stringify({
                                                type: "text",
                                                data: part.text
                                            })}\n\n`));
                                        }
                                    }
                                }

                                // Handle turn complete
                                if (message.serverContent?.turnComplete) {
                                    console.log("[Gemini Live] Turn complete");
                                    safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: "complete" })}\n\n`));
                                    if (session) session.close();
                                }
                            },
                            onerror: (e: Error) => {
                                console.error("[Gemini Live] Error:", e.message);
                                safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: e.message })}\n\n`));
                                safeClose();
                            },
                            onclose: (e: any) => {
                                console.log("[Gemini Live] Session closed", e?.reason || "");
                                safeClose();
                            },
                        },
                    });

                    // Don't send input here - we wait for setupComplete in onmessage callback
                    console.log("[Gemini Live] Session created, waiting for setupComplete...");

                } catch (error: any) {
                    console.error("[Gemini Live] Session error:", error.message);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("[Gemini Live] POST error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
