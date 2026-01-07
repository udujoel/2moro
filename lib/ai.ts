import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);

// Comprehensive model lists for robust fallback
// Tiers:
// - FAST: Good for titles, simple classifications, quick summaries. Priority: Speed & Quota.
// - SMART: Good for storytelling, deep analysis, complex reasoning. Priority: Quality.

const FAST_MODELS = [
    "gemini-2.0-flash-exp",      // User Priority
    "gemini-flash-latest",       // User Priority
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro",
];

const SMART_MODELS = [
    "gemini-3-pro-preview",      // User Priority (Top)
    "gemini-exp-1206",           // User Priority
    "gemini-2.0-flash-exp",      // User Priority
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-flash-latest"        // Ultimate Backup (Verified Working)
];

type ModelTier = 'fast' | 'smart';

// Define the Part type if not exported by library, or import it. 
// For simplicity we can use 'any' or better yet, the library's types.
// But prompt can be string | Array<string | Part>
export async function generateContentWithSmartRouter(prompt: string | Array<string | any>, tier: ModelTier = 'fast'): Promise<string> {
    const modelsToTry = tier === 'fast' ? FAST_MODELS : SMART_MODELS;
    let lastError;

    // Remove duplicates just in case
    const uniqueModels = [...new Set(modelsToTry)];

    console.log(`[AI Router] Starting generation. Tier: ${tier}. Candidates: ${uniqueModels.length}`);

    for (const modelName of uniqueModels) {
        try {
            // console.log(`[AI Router] Trying model: ${modelName}`); // Verbose log, maybe comment out for prod
            const model = genAI.getGenerativeModel({ model: modelName });

            // Set a timeout for the request to avoid hanging? (Optional optimization)
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            if (text) {
                console.log(`[AI Router] Success using model: ${modelName}`);
                return text;
            }
        } catch (error: any) {
            // Analyze Error
            const isQuota = error.message?.includes("429") || error.message?.includes("Quota") || error.status === 429;
            const isOverload = error.message?.includes("503") || error.status === 503;

            if (isQuota || isOverload) {
                console.warn(`[AI Router] Rate Limit/Overload on ${modelName}. Switching...`);
                lastError = error;
                continue; // Proceed to next model
            }

            // Log the specific error message for debugging
            console.warn(`[AI Router] Error on ${modelName} (${tier}): ${error.message}`);
            lastError = error;
        }
    }

    console.error(`[AI Router] All ${uniqueModels.length} models failed for tier ${tier}.`);
    throw new Error(`AI Router failed all attempts. Last error: ${lastError?.message}`);
}

// Backwards compatibility alias if needed, or we just update callers.
export async function generateContentWithFallback(prompt: string | Array<string | any>) {
    return generateContentWithSmartRouter(prompt, 'smart');
}

export async function summarizePeopleInternal(peopleNames: string[], memoriesContent: string[]) {
    if (!process.env.GEMINI_KEY) {
        return "AI Intelligence unavailable (Missing API Key).";
    }

    try {
        let prompt = "";

        if (peopleNames.length === 1) {
            prompt = `
              You are an insightful digital biographer.
              Analyze the relationship with "${peopleNames[0]}" based on the following memories.
              Provide a deep, single-paragraph summary of the relationship history, key themes, and emotional tone.
              Keep it encouraging and sound like a "Life OS" analysis of this specific bond.
              If the memories are sparse to create a good summary simply say "Not enough data to analyze yet".

              Memories: ${memoriesContent.join(" | ")}
            `;
        } else {
            prompt = `
              You are an insightful digital biographer. 
              Analyze the following list of people and a collection of memories associated with them.
              Provide a brief, single-paragraph insight about the user's social circle, quality of relationships, or a specific pattern you notice.
              Keep it encouraging, deep, and sounding like a "Life OS" analysis.
              
              People: ${peopleNames.join(", ")}
              Memories: ${memoriesContent.join(" | ")}
            `;
        }

        // Use Smart Router with SMART tier for insights
        return await generateContentWithSmartRouter(prompt, 'smart');

    } catch (error: any) {
        console.error("Gemini AI Error:", error);
        return "Unable to generate insight at this moment.";
    }
}

export async function generateEntryTitle(content: string, type: "text" | "image" = "text") {
    if (!process.env.GEMINI_KEY) return null;

    try {
        const prompt = `
        Read the following ${type} memory entry: "${content.substring(0, 500)}..."
        Generate a short, catchy, 3-5 word title for this memory.
        Do not use quotes. Just the title.
        `;

        // Use Smart Router with FAST tier for titles
        // This will cycle through ~6 fast models to avoid quota issues
        return await generateContentWithSmartRouter(prompt, 'fast');
    } catch (error) {
        console.error("Error generating title:", error);
        return null;
    }
}
