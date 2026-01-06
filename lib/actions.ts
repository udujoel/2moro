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

export async function getMemories(userId: string) {
    try {
        return await prisma.memory.findMany({
            where: { userId },
            orderBy: { memoryDate: 'desc' },
            include: { people: true },
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

export async function generateRelationshipInsight(userId: string) {
    console.log("Debug AI: Generating insight for user", userId);
    try {
        const people = await prisma.person.findMany({ where: { userId } });
        const memories = await prisma.memory.findMany({
            where: { userId },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Debug AI: Found ${people.length} people and ${memories.length} memories`);

        if (people.length === 0 && memories.length === 0) {
            return "No data available to analyze yet. Start adding memories and people to generate insights.";
        }

        const peopleNames = people.map(p => p.name);
        const memoryContext = memories.map(m => m.content);

        return await summarizePeopleInternal(peopleNames, memoryContext);
    } catch (error) {
        console.error("Error generating insight:", error);
        return "Insight generation failed.";
    }
}
