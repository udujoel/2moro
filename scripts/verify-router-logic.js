// This script verifies the Smart Router logic by mocking the AI provider
// It demonstrates how the router switches models upon failures.

const FAST_MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro"
];

// Mock the AI Client
const mockGenAI = {
    getGenerativeModel: ({ model }) => {
        return {
            generateContent: async (prompt) => {
                console.log(`[MockAI] Received request for model: ${model}`);

                // Simulate failure for the first 2 models
                if (model === "gemini-1.5-flash" || model === "gemini-2.0-flash-exp") {
                    const e = new Error("429 Too Many Requests");
                    e.status = 429;
                    throw e;
                }

                // Simulate success for the 3rd model
                return {
                    response: {
                        text: () => `Success response from ${model}`
                    }
                };
            }
        };
    }
};

async function testSmartRouter() {
    console.log("--- Starting Smart Router Logic Test ---");
    console.log("Tier: FAST");
    console.log("Models:", FAST_MODELS);

    // Router Logic (Copied from implementation for verification)
    const uniqueModels = [...new Set(FAST_MODELS)];
    let lastError;

    for (const modelName of uniqueModels) {
        try {
            console.log(`\n[Router] Trying model: ${modelName}`);
            const model = mockGenAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("test prompt");
            const text = result.response.text();

            if (text) {
                console.log(`[Router] ✅ Success! Used model: ${modelName}`);
                console.log(`[Router] Output: "${text}"`);
                return;
            }
        } catch (error) {
            const isQuota = error.message?.includes("429") || error.message?.includes("Quota") || error.status === 429;
            if (isQuota) {
                console.warn(`[Router] ⚠️ Quote Limit hit on ${modelName}. Switching...`);
                lastError = error;
                continue;
            }
            console.error(`[Router] Generic error:`, error);
        }
    }
    console.error("All models failed");
}

testSmartRouter();
