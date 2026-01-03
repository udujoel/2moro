"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeImageAndCreateMemory(userId: string, formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) return { error: "No file uploaded" };

    // 1. Convert to Buffer/Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    try {
        // 2. Persist to DB (User Avatar)
        await prisma.user.update({
            where: { id: userId },
            data: { avatar: base64Image }
        });

        // 3. AI Analysis
        // For gemini-1.5-flash, we pass inline data
        const imagePart = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: file.type,
            },
        };

        const prompt = "Analyze this profile picture. Predict the person's age (just a number) and give me 3 personality keywords that describe the vibe, comma separated. Format: Age: [number], Vibe: [word, word, word].";
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        console.log("AI Image Analysis:", responseText);

        // Parse (Simple regex or split)
        // Expected: "Age: 25, Vibe: Cheerful, Professional, Creative"
        let age = "25";
        let vibe = "Adventurer";

        const ageMatch = responseText.match(/Age:\s*(\d+)/i);
        if (ageMatch) age = ageMatch[1];

        const vibeMatch = responseText.match(/Vibe:\s*(.*)/i);
        if (vibeMatch) vibe = vibeMatch[1];

        // 4. Create Memory
        await prisma.memory.create({
            data: {
                userId,
                type: "image",
                content: `Uploaded profile picture. AI Analysis: ${responseText}`,
                memoryDate: new Date()
            }
        });

        return {
            success: true,
            avatar: base64Image,
            predictedAge: parseInt(age),
            predictedVibe: vibe
        };

    } catch (error) {
        console.error("Error in analyzeImageAndCreateMemory:", error);
        return { error: "Failed to process image." };
    }
}

export async function analyzeHoroscopeAndTraits(dobString: string) {
    if (!dobString) return { error: "No DOB" };

    try {
        const prompt = `
            The user was born on ${dobString}. 
            1. Determine their Zodiac sign.
            2. List 6 potential "negative" traits or struggles associated with this sign (short phrases, e.g., "Impulsive decision making").
            3. List 6 corresponding "fixes" or habits to counter them (short phrases, e.g., "Wait 2 minutes before deciding").
            
            Return ONLY JSON format like this:
            {
                "zodiac": "Aries",
                "negatives": ["trait1", "trait2", "trait3", "trait4", "trait5", "trait6"],
                "fixes": ["fix1", "fix2", "fix3", "fix4", "fix5", "fix6"]
            }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return { success: true, ...data };
    } catch (error) {
        console.error("Gemini Horoscope Error:", error);
        // Fallback
        return {
            success: true,
            zodiac: "Unknown",
            negatives: ["Stress", "Procrastination", "Anxiety", "Disorganization", "Lack of Sleep"],
            fixes: ["Meditate", "Pomodoro Timer", "Breathwork", "Planner", "No screens after 10PM"]
        };
    }
}
