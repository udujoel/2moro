import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);

// Fallback hierarchy: User Request (3 Pro) -> Pro Fallback (2 Pro) -> Speed/Quota Fallback (1.5 Flash)
// Fallback hierarchy: User Request (3 Pro) -> Pro Fallback (2 Pro) -> Speed/Quota Fallback (2.0 Flash -> Flash Latest)
const MODELS_TO_TRY = [
    "gemini-3-pro-preview",
    "gemini-exp-1206",
    "gemini-2.0-flash-exp",
    "gemini-flash-latest"
];

// Helper to handle fallback across models
export async function generateContentWithFallback(prompt: string | any[]): Promise<string> {
    let lastError;

    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`[AI] Attempting generation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            // Check for Rate Limit (429) or Overload (503)
            // Error structure might vary, often "status" or "statusText" or message
            const isQuotaError = error.message?.includes("429") || error.message?.includes("Quota") || error.status === 429;
            const isOverloadError = error.message?.includes("503") || error.status === 503;

            if (isQuotaError || isOverloadError) {
                console.warn(`[AI] Model ${modelName} failed (Quota/Overload). Retrying with next model...`);
                lastError = error;
                continue; // Try next model
            } else {
                console.error(`[AI] Model ${modelName} failed with non-retriable error.`);
                throw error; // Other errors (e.g. Invalid Argument) should probably fail fast
            }
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError?.message || "Unknown"}`);
}

export async function summarizePeopleInternal(peopleNames: string[], memoriesContent: string[]) {
    if (!process.env.GEMINI_KEY) {
        return "AI Intelligence unavailable (Missing API Key).";
    }

    try {
        const prompt = `
      You are an insightful digital biographer. 
      Analyze the following list of people and a collection of memories associated with them.
      Provide a brief, single-paragraph insight about the user's social circle, quality of relationships, or a specific pattern you notice.
      Keep it encouraging, deep, and sounding like a "Life OS" analysis.
      
      People: ${peopleNames.join(", ")}
      Memories: ${memoriesContent.join(" | ")}
    `;

        // Use the fallback mechanism
        return await generateContentWithFallback(prompt);

    } catch (error: any) {
        console.error("Gemini AI Error:", error);
        return "Unable to generate insight at this moment.";
    }
}
