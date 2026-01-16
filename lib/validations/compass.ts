import { z } from "zod";

/**
 * Compass feature validation schemas
 */

// Schema for personality test
export const personalityTestSchema = z.object({
    mbtiType: z.string().length(4, "MBTI type must be 4 characters").regex(/^[EI][NS][TF][JP]$/, "Invalid MBTI type"),
    description: z.string().max(2000).optional(),
    traits: z.record(z.string(), z.any()).optional(),
    responses: z.record(z.string(), z.any()).optional(),
});

// Schema for creating a todo
export const createTodoSchema = z.object({
    task: z.string().min(1, "Task is required").max(500, "Task too long"),
    category: z.string().max(50).optional().default("general"),
    description: z.string().max(2000).optional(),
    timeframe: z.enum(["today", "week", "month", "quarter"]).optional().default("today"),
    dueDate: z.coerce.date().optional(),
    priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

// Schema for updating todo status
export const updateTodoStatusSchema = z.object({
    todoId: z.string().uuid("Invalid todo ID"),
    status: z.enum(["pending", "completed", "dismissed"]),
});

// Schema for deleting a todo
export const deleteTodoSchema = z.object({
    todoId: z.string().uuid("Invalid todo ID"),
});

// Schema for financial snapshot
export const financialSnapshotSchema = z.object({
    monthlyIncome: z.number().min(0, "Income must be positive").max(100000000),
    monthlyExpenses: z.number().min(0, "Expenses must be positive").max(100000000),
    savings: z.number().min(0).max(100000000000).optional().default(0),
    debt: z.number().min(0).max(100000000000).optional().default(0),
    investments: z.number().min(0).max(100000000000).optional().default(0),
    emergencyFund: z.number().min(0).optional(),
    retirementGoal: z.number().min(0).optional(),
});

// Schema for recommendation acceptance
export const acceptRecommendationSchema = z.object({
    id: z.string().optional(),
    category: z.string().min(1).max(50),
    task: z.string().min(1).max(500),
    description: z.string().max(2000).nullable().optional(),
});

// Schema for timeframe query
export const timeframeSchema = z.object({
    timeframe: z.enum(["today", "week", "month", "quarter"]),
});

// Schema for investment preferences
export const investmentPreferenceSchema = z.object({
    riskTolerance: z.enum(["conservative", "moderate", "aggressive"]),
    investmentHorizon: z.number().int().min(1).max(50).optional(),
    monthlyContribution: z.number().min(0).max(1000000).optional(),
});

// Type exports
export type PersonalityTestInput = z.infer<typeof personalityTestSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoStatusInput = z.infer<typeof updateTodoStatusSchema>;
export type DeleteTodoInput = z.infer<typeof deleteTodoSchema>;
export type FinancialSnapshotInput = z.infer<typeof financialSnapshotSchema>;
export type AcceptRecommendationInput = z.infer<typeof acceptRecommendationSchema>;
export type TimeframeInput = z.infer<typeof timeframeSchema>;
export type InvestmentPreferenceInput = z.infer<typeof investmentPreferenceSchema>;
