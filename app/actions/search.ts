"use server";

import { prisma } from "@/lib/db";
import { getMemories } from "@/lib/actions";

export interface SearchResult {
    id: string;
    type: "memory" | "person";
    content: string;
    date?: string;
}

export async function searchContent(userId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    console.log(`Debug Search: Searching for '${query}' for user ${userId}`);

    // Fetch all (or recent) memories
    // In a real app with vector DB, we'd embed the query.
    // Here we use Prisma contains for MVP.
    // Also, we can try to interpret the query if it contains date keywords ("yesterday").

    // 1. Simple Keyword Search
    const memories = await prisma.memory.findMany({
        where: {
            userId,
            content: {
                contains: query,
                mode: 'insensitive'
            }
        },
        take: 5,
        orderBy: { memoryDate: 'desc' }
    });

    // 2. People Search
    const people = await prisma.person.findMany({
        where: {
            userId,
            name: {
                contains: query,
                mode: 'insensitive'
            }
        },
        take: 3
    });

    const results: SearchResult[] = [
        ...memories.map(m => ({
            id: m.id,
            type: "memory" as const,
            content: m.content,
            date: m.memoryDate.toISOString()
        })),
        ...people.map(p => ({
            id: p.id,
            type: "person" as const,
            content: p.name,
        }))
    ];

    return results;
}
