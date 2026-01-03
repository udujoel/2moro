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

export async function createMemory(userId: string, content: string, date: Date, type: string = "text", personIds: string[] = []) {
    try {
        return await prisma.memory.create({
            data: {
                userId,
                content,
                memoryDate: date,
                type,
                people: {
                    connect: personIds.map(id => ({ id })),
                },
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
