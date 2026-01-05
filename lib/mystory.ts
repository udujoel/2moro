"use server";

import { prisma } from "@/lib/db";
import { generateContentWithFallback } from "./ai";

export async function getBiography(userId: string) {
    return await prisma.biographyChapter.findMany({
        where: { userId },
        orderBy: { order: 'asc' } // or startDate
    });
}

export async function generateMyStory(userId: string) {
    try {
        // 1. Fetch all memories
        const memories = await prisma.memory.findMany({
            where: { userId },
            orderBy: { memoryDate: 'asc' },
            include: { people: true, media: true }
        });

        if (memories.length === 0) return { success: false, message: "No memories to narrate." };

        // 2. Group by Year
        const memoriesByYear: Record<string, typeof memories> = {};
        memories.forEach(m => {
            const year = m.memoryDate.getFullYear().toString();
            if (!memoriesByYear[year]) memoriesByYear[year] = [];
            memoriesByYear[year].push(m);
        });

        // 3. Generate Chapters
        // Delete existing chapters for full regeneration (simplest for Phase 3)
        await prisma.biographyChapter.deleteMany({ where: { userId } });

        let orderCount = 1;
        const chapters = [];

        for (const [year, yearlyMemories] of Object.entries(memoriesByYear)) {
            const memoryContext = yearlyMemories.map(m => `
                Date: ${m.memoryDate.toDateString()}
                Location: ${m.locationName || "Unknown"}
                People: ${m.people.map(p => p.name).join(", ")}
                Content: ${m.content}
            `).join("\n---\n");

            const prompt = `
                You are a master biographer writing the life story of the user.
                Write a compelling, narrative chapter for the year ${year} based on the following notes (memories).
                
                Guidelines:
                - Title the chapter creatively.
                - Write in the first person ("I").
                - Weave the memories into a cohesive story.
                - If there are gaps, focus on the emotions and growth implied by the events.
                - Use a literary, engaging tone (like a high-quality memoir).
                - Format in Markdown (use paragraphs, maybe bold for emphasis, but no headers unless necessary).
                
                Memories:
                ${memoryContext}
            `;

            const generatedText = await generateContentWithFallback(prompt);

            // Extract title (first line if it starts with # or just first line)
            const lines = generatedText.split('\n');
            let title = `Chapter ${orderCount}: ${year}`;
            let content = generatedText;

            // Simple title extraction heuristic
            if (lines[0].trim().startsWith('#')) {
                title = lines[0].replace(/^#+\s*/, '').trim();
                content = lines.slice(1).join('\n').trim();
            } else if (lines[0].trim().length < 50 && lines[0].trim().length > 0) {
                title = lines[0].trim();
                content = lines.slice(1).join('\n').trim();
            }

            const chapter = await prisma.biographyChapter.create({
                data: {
                    userId,
                    title,
                    content,
                    order: orderCount++,
                    startDate: new Date(`${year}-01-01`),
                    endDate: new Date(`${year}-12-31`)
                }
            });
            chapters.push(chapter);
        }

        return { success: true, count: chapters.length };

    } catch (error) {
        console.error("Error generating MyStory:", error);
        return { success: false, error };
    }
}
