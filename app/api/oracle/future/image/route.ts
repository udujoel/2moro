import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);

/**
 * POST /api/oracle/future/image
 * Generate age-progressed scenario images using Gemini
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, scenarios, originalPhotoBase64 } = await req.json();

        if (!userId || !scenarios) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fetch user for context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

        const userName = user?.name || "the person";

        // Generate images for each scenario
        const generatedImages: string[] = [];

        for (const scenario of scenarios) {
            try {
                // Create descriptive prompt for each scenario
                const imagePrompt = `Create a photorealistic portrait visualization of ${userName} 20 years in the future.
                
Scenario: ${scenario.type === "optimistic" ? "Best possible future - healthy, successful, glowing with happiness"
                        : scenario.type === "current" ? "Realistic projection - natural aging, stable life, content expression"
                            : "Warning path - signs of stress, less vitality, tired but resilient"}

Context: ${scenario.description}

Style: Warm, cinematic lighting, professional portrait photography style.
The subject should appear genuinely aged (add 20 years), with natural age-appropriate features.
Background should subtly suggest their life circumstances.
Do NOT include any text or labels in the image.`;

                // Use Gemini's vision/image model
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

                // Generate descriptive image (since Gemini doesn't generate images directly,
                // we'll generate a detailed visual description that could be used with an image API)
                const result = await model.generateContent(`
                    Create a detailed visual description for an AI image generator.
                    Target: ${imagePrompt}
                    
                    Respond with ONLY a single detailed image prompt (no explanation), 
                    suitable for Stable Diffusion or DALL-E.
                    Keep it under 200 words.
                `);

                const imageDescription = result.response.text();

                // For now, store the description as we don't have direct image generation
                // In production, this would call Imagen, DALL-E, or Stable Diffusion
                generatedImages.push(imageDescription || "");

            } catch (imgError: any) {
                console.error(`[Future/Image] Error generating image for ${scenario.type}:`, imgError.message);
                generatedImages.push(""); // Push empty for failed generation
            }
        }

        // Update the latest visualization with image descriptions
        const latestVisualization = await prisma.futureVisualization.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        if (latestVisualization) {
            await prisma.futureVisualization.update({
                where: { id: latestVisualization.id },
                data: {
                    scenarioImages: generatedImages
                }
            });
        }

        return NextResponse.json({
            success: true,
            imageDescriptions: generatedImages,
            note: "Image descriptions generated. Full image generation requires an image API (Imagen, DALL-E, etc.)"
        });

    } catch (error: any) {
        console.error("[Future/Image] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
