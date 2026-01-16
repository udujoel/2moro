import { z } from "zod";

/**
 * User-related validation schemas
 */

// Schema for creating/updating a person
export const personSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    relationship: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
    avatar: z.string().url().optional().or(z.literal("")),
});

// Schema for person ID parameter
export const personIdSchema = z.object({
    personId: z.string().uuid("Invalid person ID"),
});

// Schema for user profile update
export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    avatar: z.string().url().optional().or(z.literal("")),
    dateOfBirth: z.coerce.date().optional(),
    zodiac: z.string().max(30).optional(),
});

// Schema for user preferences
export const userPreferencesSchema = z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    notifications: z.boolean().optional(),
    emailDigest: z.boolean().optional(),
    riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
    investmentHorizon: z.number().int().min(1).max(50).optional(),
    monthlyContribution: z.number().min(0).max(1000000).optional(),
});

// Type exports
export type PersonInput = z.infer<typeof personSchema>;
export type PersonIdInput = z.infer<typeof personIdSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
