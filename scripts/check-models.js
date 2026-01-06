const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// Also try local just in case
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development.local') });
// Note: .env.local might not load in simple node script without dotenv logic, but let's try assuming env is present or we need to load it.
// Actually next.js loads .env.local automatically but node doesn't.
// I'll try to rely on the user running it with their env setup or just loading .env

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");

const SMART_MODELS = [
    "gemini-3-pro-preview",
    "gemini-exp-1206",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.0-pro",
    "gemini-pro"
];

const FAST_MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro",
];

async function checkModels() {
    console.log("Checking API Key availability...");
    if (!process.env.GEMINI_KEY) {
        console.error("ERROR: GEMINI_KEY is missing in process.env");
        return;
    }
    console.log("GEMINI_KEY found (" + process.env.GEMINI_KEY.substring(0, 5) + "...)");

    const allModels = [...new Set([...SMART_MODELS, ...FAST_MODELS])];

    for (const modelName of allModels) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello."); // Short prompt
            const text = result.response.text();
            console.log(`✅ OK`);
        } catch (e) {
            console.log(`❌ FAILED`);
            let msg = e.message || "Unknown error";
            if (msg.includes("404")) msg = "404 Not Found (Invalid Name?)";
            if (msg.includes("429")) msg = "429 Rate Limit";
            if (msg.includes("403")) msg = "403 Forbidden (No Access?)";
            console.log(`   -> ${msg}`);
        }
    }
}

checkModels();
