import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, RawReferenceImage } from "@google/genai";
import { prisma } from "@/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY as string });

// Models for image editing/generation
const EDIT_IMAGE_MODELS = [
    "imagen-3.0-capability-001",
    "imagen-3.0-capability-preview-0930"
];

const GENERATE_IMAGE_MODELS = [
    "imagen-3.0-generate-002",
    "imagen-3.0-generate-001",
    "imagen-3.0-fast-generate-001"
];

/**
 * POST /api/oracle/future/image
 * Generate age-progressed scenario images using Google Imagen
 * Uses the uploaded photo as reference to create aged versions for each scenario
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

        const userName = user?.name?.split(" ")[0] || "this person";
        const generatedImages: string[] = [];

        // Process each scenario
        for (const scenario of scenarios) {
            const scenarioType = scenario.type as string;
            let imageGenerated = false;

            // Build the age progression prompt for this scenario
            const agePrompt = buildAgeProgressionPrompt(scenarioType, scenario.description, userName);

            // If user uploaded a photo, try to use editImage for true age progression
            if (originalPhotoBase64) {
                for (const modelName of EDIT_IMAGE_MODELS) {
                    if (imageGenerated) break;

                    try {
                        console.log(`[Future/Image] Trying ${modelName} for ${scenarioType} age progression`);

                        // Extract base64 data from data URL
                        const base64Data = originalPhotoBase64.replace(/^data:image\/\w+;base64,/, "");

                        // Create reference image from the uploaded photo
                        const referenceImage = RawReferenceImage.fromBase64(base64Data, "image/jpeg");

                        const response = await ai.models.editImage({
                            model: modelName,
                            prompt: agePrompt,
                            referenceImages: [referenceImage],
                            config: {
                                numberOfImages: 1
                            }
                        });

                        if (response.generatedImages && response.generatedImages.length > 0) {
                            const image = response.generatedImages[0];
                            if (image.image?.imageBytes) {
                                const base64Image = `data:image/png;base64,${image.image.imageBytes}`;
                                generatedImages.push(base64Image);
                                imageGenerated = true;
                                console.log(`[Future/Image] Successfully generated ${scenarioType} with ${modelName}`);
                            }
                        }
                    } catch (editError: any) {
                        console.warn(`[Future/Image] editImage ${modelName} failed: ${editError.message}`);
                    }
                }
            }

            // Fallback: Generate new image from scratch (text-to-image)
            if (!imageGenerated) {
                for (const modelName of GENERATE_IMAGE_MODELS) {
                    if (imageGenerated) break;

                    try {
                        console.log(`[Future/Image] Fallback: trying ${modelName} for ${scenarioType}`);

                        const response = await ai.models.generateImages({
                            model: modelName,
                            prompt: agePrompt,
                            config: {
                                numberOfImages: 1,
                                aspectRatio: "1:1"
                            }
                        });

                        if (response.generatedImages && response.generatedImages.length > 0) {
                            const image = response.generatedImages[0];
                            if (image.image?.imageBytes) {
                                const base64Image = `data:image/png;base64,${image.image.imageBytes}`;
                                generatedImages.push(base64Image);
                                imageGenerated = true;
                                console.log(`[Future/Image] Fallback success with ${modelName}`);
                            }
                        }
                    } catch (genError: any) {
                        console.warn(`[Future/Image] generateImages ${modelName} failed: ${genError.message}`);
                    }
                }
            }

            // If all models failed, push empty string
            if (!imageGenerated) {
                console.warn(`[Future/Image] All models failed for ${scenarioType}`);
                generatedImages.push("");
            }
        }

        // Update the latest visualization with generated images
        const latestVisualization = await prisma.futureVisualization.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        if (latestVisualization) {
            await prisma.futureVisualization.update({
                where: { id: latestVisualization.id },
                data: {
                    scenarioImages: generatedImages.filter(img => img !== "")
                }
            });
        }

        return NextResponse.json({
            success: true,
            images: generatedImages,
            generatedCount: generatedImages.filter(img => img !== "").length,
            hasUploadedPhoto: !!originalPhotoBase64
        });

    } catch (error: any) {
        console.error("[Future/Image] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Build a detailed prompt for age progression based on scenario type
 */
function buildAgeProgressionPrompt(scenarioType: string, description: string, userName: string): string {
    const basePrompt = `Transform this photo to show ${userName} aged 20 years into the future.`;

    if (scenarioType === "optimistic") {
        return `${basePrompt}
        
This is their BEST possible future. Age them naturally but show:
- Healthy, vibrant appearance despite 20 years of aging
- Natural gray/silver hair styled nicely
- Genuine warm smile with visible laugh lines
- Eyes that sparkle with contentment and wisdom
- Healthy skin with graceful aging
- Confident, successful posture
- Well-groomed, put-together appearance

Context: ${description}

Style: Professional portrait, warm lighting, high quality, photorealistic.`;
    } else if (scenarioType === "current") {
        return `${basePrompt}
        
This is their REALISTIC trajectory. Age them naturally showing:
- Typical aging over 20 years
- Some gray hair, natural hair changes
- Normal age lines and wrinkles
- Content but ordinary expression
- Average health appearance
- Relaxed, comfortable demeanor

Context: ${description}

Style: Natural portrait, neutral lighting, high quality, photorealistic.`;
    } else {
        return `${basePrompt}
        
This is a WARNING path. Age them showing signs of stress:
- Accelerated aging appearance
- More prominent gray hair
- Deeper worry lines, tired eyes
- Less vitality in expression
- Signs of stress and exhaustion
- Still dignified but clearly worn
- Tired but resilient expression

Context: ${description}

Style: Dramatic portrait, slightly harsh lighting, high quality, photorealistic.`;
    }
}
