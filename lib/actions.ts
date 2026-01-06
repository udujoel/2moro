"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { summarizePeopleInternal } from './ai';

// --- User Actions ---

export async function getOrCreateUser(email: string, name: string) {
    try {
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    title: "Traveler",
                },
            });
        }
        return user;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
}

export async function updateUser(id: string, data: { name?: string; title?: string; bio?: string; avatar?: string; onboardingCompleted?: boolean }) {
    try {
        const user = await prisma.user.update({
            where: { id },
            data,
        });
        revalidatePath("/"); // Revalidate everywhere the user info might be shown
        return user;
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
}

// --- Memory Actions ---

export async function getMemories(userId: string, page: number = 1, limit: number = 30, personId?: string) {
    try {
        const skip = (page - 1) * limit;
        const where: any = { userId };

        if (personId) {
            where.people = { some: { id: personId } };
        }

        return await prisma.memory.findMany({
            where,
            orderBy: { memoryDate: 'desc' },
            include: { people: true },
            skip,
            take: limit,
        });
    } catch (error) {
        console.error("Error fetching memories:", error);
        return [];
    }
}

// ... imports
import { generateEntryTitle } from './ai';

// ... (other functions)

async function fetchWeather(lat: number, lng: number, date: Date) {
    try {
        // Open-Meteo Archive API for historical data (or near past)
        // Format date as YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&daily=weather_code,temperature_2m_max&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.daily && data.daily.weather_code) {
            const code = data.daily.weather_code[0];
            const temp = data.daily.temperature_2m_max[0];

            // Map WMO codes to simple icons/conditions
            // 0=Clear, 1-3=Cloudy, 45-48=Fog, 51-67=Rain, 71-77=Snow, 95-99=Storm
            let condition = "Sunny";
            let icon = "sun";

            if (code > 0 && code <= 3) { condition = "Cloudy"; icon = "cloud"; }
            else if (code >= 45 && code <= 48) { condition = "Foggy"; icon = "cloud-fog"; }
            else if (code >= 51 && code <= 67) { condition = "Rainy"; icon = "cloud-rain"; }
            else if (code >= 71 && code <= 77) { condition = "Snowy"; icon = "snowflake"; }
            else if (code >= 80 && code <= 99) { condition = "Stormy"; icon = "cloud-lightning"; }

            return {
                temp,
                condition,
                icon,
                code
            };
        }
    } catch (e) {
        console.error("Weather fetch failed:", e);
    }
    return null;
}

export async function createMemory(
    userId: string,
    content: string,
    date: Date,
    type: string = "text",
    personIds: string[] = [],
    location?: { name?: string; lat?: number; lng?: number },
    media?: { url: string; type: "image" | "video" | "audio" }[]
) {
    console.log("Debug: createMemory called", { userId, type, mediaCount: media?.length, personIds });
    try {
        // 1. Generate Title if text
        let title = null;
        try {
            if (type === "text" && content.length > 10) {
                title = await generateEntryTitle(content, "text");
            } else if (type === "image") {
                title = "Visual Memory";
                if (content && content.length > 5) title = await generateEntryTitle(content, "image");
            }
        } catch (err) {
            console.warn("AI Title generation failed, falling back.", err);
        }

        // 2. Fetch Weather
        let weather = null;
        try {
            if (location?.lat && location?.lng) {
                weather = await fetchWeather(location.lat, location.lng, date);
            }
        } catch (err) {
            console.warn("Weather fetch failed.", err);
        }

        return await prisma.memory.create({
            data: {
                userId,
                content,
                memoryDate: date,
                type,
                locationName: location?.name,
                latitude: location?.lat,
                longitude: location?.lng,
                title: title || "New Memory",
                weather: weather || undefined,
                people: {
                    connect: personIds.map(id => ({ id })),
                },
                media: media ? {
                    create: media.map(m => ({
                        url: m.url,
                        type: m.type
                    }))
                } : undefined,
                // Backwards compatibility for single media
                mediaUrl: media && media.length > 0 ? media[0].url : undefined
            },
        });
    } catch (error) {
        console.error("Error creating memory:", error);
        return null;
    }
}

export async function deleteMemory(memoryId: string) {
    try {
        await prisma.memory.delete({
            where: { id: memoryId },
        });
        revalidatePath("/archive");
        return { success: true };
    } catch (error) {
        console.error("Error deleting memory:", error);
        return { success: false, error };
    }
}

// --- Person Actions ---

export async function getPeople(userId: string) {
    try {
        return await prisma.person.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { memories: true }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching people:", error);
        return [];
    }
}

export async function createPerson(userId: string, data: any) {
    try {
        return await prisma.person.create({
            data: {
                ...data,
                userId
            }
        });
    } catch (error) {
        console.error("Error creating person:", error);
        return null;
    }
}

export async function generateRelationshipInsight(userId: string, personId?: string, timeRange: "all" | "6m" | "1y" = "all") {
    console.log("Debug AI: Generating insight", { userId, personId, timeRange });
    try {
        // 1. Calculate Date Cutoff
        let dateFilter = {};
        if (timeRange !== "all") {
            const now = new Date();
            const past = new Date();
            if (timeRange === "6m") past.setMonth(now.getMonth() - 6);
            if (timeRange === "1y") past.setFullYear(now.getFullYear() - 1);
            dateFilter = {
                gte: past
            };
        }

        // 2. Fetch People (Single or All)
        let peopleNames = [];
        if (personId) {
            const p = await prisma.person.findUnique({ where: { id: personId } });
            if (p) peopleNames.push(p.name);
        } else {
            const ppl = await prisma.person.findMany({ where: { userId } });
            peopleNames = ppl.map(p => p.name);
        }

        // 3. Fetch Memories
        // If personId is set, we MUST filter memories that include this person.
        // Prisma limitation: 'people' is a many-to-many relation.
        const memoryWhere: any = {
            userId,
            memoryDate: dateFilter, // Apply time range
        };

        if (personId) {
            memoryWhere.people = {
                some: { id: personId }
            };
        }

        const memories = await prisma.memory.findMany({
            where: memoryWhere,
            take: 50, // Increase context size for "All Memories" summary
            orderBy: { memoryDate: 'desc' }
        });

        console.log(`Debug AI: Found ${peopleNames.length} names and ${memories.length} memories`);

        if (memories.length === 0) {
            return "No memories found for this period.";
        }

        const memoryContext = memories.map(m => `[${m.memoryDate.toLocaleDateString()}] ${m.content}`);

        return await summarizePeopleInternal(peopleNames, memoryContext);
    } catch (error) {
        console.error("Error generating insight:", error);
        return "Insight generation failed.";
    }
}
