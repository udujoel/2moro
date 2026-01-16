"use server";

import { generateMyStory } from "@/lib/mystory";
import { revalidatePath } from "next/cache";
import { generateTTS } from "@/lib/elevenlabs";
import { getServerUser } from "@/lib/session";

/**
 * Regenerate the user's autobiography story
 */
export async function regenerateStory() {
    const { userId } = await getServerUser();

    try {
        const result = await generateMyStory(userId);

        if (result.success) {
            revalidatePath("/mystory");
            return { success: true, message: `Generated ${result.count} chapters` };
        }

        return { success: false, message: result.message || "Failed to generate story" };
    } catch (error: any) {
        console.error("Error regenerating story:", error);
        return { success: false, message: error.message || "An error occurred" };
    }
}

/**
 * Generate audiobook audio from text (doesn't need userId)
 */
export async function generateAudiobook(text: string) {
    try {
        const audioBuffer = await generateTTS(text);
        const base64Audio = audioBuffer.toString("base64");
        return {
            success: true,
            audio: `data:audio/mpeg;base64,${base64Audio}`
        };
    } catch (error: any) {
        console.error("Audio generation failed:", error);
        return { success: false, message: error.message || "Failed to generate audio" };
    }
}

/**
 * Generate book cover (not yet implemented)
 */
export async function generateCoverAction(title: string) {
    const { userId } = await getServerUser();
    // Phase 9: Implement DALL-E cover generation
    return { success: false, message: "Cover generation not yet implemented" };
}

/**
 * Generate chapter illustration (doesn't need userId directly)
 */
export async function generateIllustrationAction(chapterId: string, prompt: string) {
    // Phase 9: Implement chapter illustration generation
    return { success: false, message: "Illustration generation not yet implemented" };
}

/**
 * Export story as PDF
 */
export async function exportStoryAsPDF() {
    const { userId } = await getServerUser();
    // Phase 9: Implement PDF export
    return { success: false, message: "PDF export not yet implemented" };
}
