
const { generateContentWithSmartRouter } = require('./lib/ai');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mock process.env needed for the library if it reads directly, 
// but we need to load env vars.
// We can use dotenv.
require('dotenv').config({ path: '.env.local' });

async function test() {
    console.log("Testing AI Voice Tier...");
    try {
        const res = await generateContentWithSmartRouter("Hello, are you there?", 'voice');
        console.log("Result:", res);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
