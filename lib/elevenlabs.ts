export async function generateTTS(text: string) {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not set");
    }

    const voiceId = "cgSgspJ2msm6clMCkdW9"; // Jessica - friendly and clear
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(errorData)}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
