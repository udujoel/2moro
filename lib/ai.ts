import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("Gemini AI Error:", error);
        return "Unable to generate insight at this moment.";
    }
}
