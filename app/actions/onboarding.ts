"use server";

import { generateContentWithFallback } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

        // USE FALLBACK
        const responseText = await generateContentWithFallback([prompt, imagePart]);

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
                mediaUrl: base64Image, // CRITICAL FIX: Save the image data here for Archive
                memoryDate: new Date()
            }
        });

        return {
            success: true,
            avatar: base64Image,
            predictedAge: parseInt(age),
            predictedVibe: vibe
        };

    } catch (error: any) {
        console.error("Error in analyzeImageAndCreateMemory:", error);
        // Log specific Gemini error details if available
        if (error.response) {
            console.error("Gemini Response Error:", JSON.stringify(error.response, null, 2));
        }
        return { error: `Failed to process image: ${error.message || "Unknown error"}` };
    }
}

// ... existing imports ...

// New function for Personality + Traits generation
export async function analyzePersonalityAndTraits(zodiac: string, quizResults: any) {
    try {
        const prompt = `
            User Profile:
            - Zodiac: ${zodiac}
            - Quiz Answers: ${JSON.stringify(quizResults)}

            Task:
            1. Determine the user's MBTI-style personality type (e.g., INFJ, ENFP) and a 1-line description.
            2. Generate a "Me Now" list (5 current flaws/struggles based on this profile).
            3. Generate a "Me 2moro" list (5 future habits/strengths to cultivate).

            Return ONLY JSON:
            {
                "personalityType": "INFJ - The Advocate",
                "personalityDescription": "Deeply empathetic and visionary...",
                "meNow": ["Overthinking", "People Pleasing", ...],
                "me2moro": ["Boundary Setting", "Daily Meditation", ...]
            }
        `;

        const text = await generateContentWithFallback(prompt);

        // Usage cleaning
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return { success: true, ...data };
    } catch (error) {
        console.error("Gemini Personality Error:", error);
        return {
            success: false,
            personalityType: "Explorer",
            personalityDescription: "Navigating life with curiosity.",
            meNow: ["Uncertainty", "Stress"],
            me2moro: ["Clarity", "Peace"]
        };
    }
}

export async function analyzeHoroscopeAndTraits(dobString: string) {
    // ... keepting existing for now, but strictly returning Zodiac only might be cleaner 
    // since we do traits later. But existing flow expects negatives/fixes. 
    // We can simplify this to just return Zodiac if we want, OR keep it as a fallback/first pass.
    // The user requirement says "after reading the horoscope... personality check... THEN generate Me Now".
    // So this function should primarily return the ZODIAC sign now.

    if (!dobString) return { error: "No DOB" };

    try {
        const prompt = `
            The user was born on ${dobString}. 
            Determine their Zodiac sign.
            Return ONLY the sign name (e.g. "Aries").
        `;

        const text = await generateContentWithFallback(prompt);
        const zodiac = text.trim().replace(/\*/g, "").replace(/\./g, "");

        return { success: true, zodiac };
    } catch (error) {
        return { success: true, zodiac: "Unknown" }; // Fail graceful
    }
}
