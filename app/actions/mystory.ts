"use server";

import { generateMyStory } from "@/lib/mystory";
import { revalidatePath } from "next/cache";

export async function regenerateStory(userId: string) {
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

export async function exportStoryAsPDF(userId: string) {
    // TODO: Implement PDF export
    // This will require jsPDF library
    return { success: false, message: "PDF export not yet implemented" };
}
