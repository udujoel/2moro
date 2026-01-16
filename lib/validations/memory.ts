import { z } from "zod";

/**
 * Memory validation schemas
 */

// Schema for creating a new memory
export const createMemorySchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    content: z.string().min(1, "Content is required").max(10000, "Content too long"),
    memoryDate: z.coerce.date().optional(),
    location: z.string().max(200).optional(),
    weather: z.string().max(50).optional(),
    mood: z.string().max(50).optional(),
    mediaUrl: z.string().url().optional().or(z.literal("")),
    taggedPeople: z.array(z.string().uuid()).optional().default([]),
});

// Schema for updating a memory
export const updateMemorySchema = createMemorySchema.partial().extend({
    id: z.string().uuid("Invalid memory ID"),
});

// Schema for deleting a memory
export const deleteMemorySchema = z.object({
    memoryId: z.string().uuid("Invalid memory ID"),
});

// Schema for memory query filters
export const memoryQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    offset: z.coerce.number().int().min(0).optional().default(0),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    personId: z.string().uuid().optional(),
    search: z.string().max(100).optional(),
});

// Type exports for use in actions
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
export type DeleteMemoryInput = z.infer<typeof deleteMemorySchema>;
export type MemoryQueryInput = z.infer<typeof memoryQuerySchema>;
