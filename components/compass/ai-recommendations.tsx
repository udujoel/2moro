"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Briefcase,
    Heart,
    Activity,
    Brain,
    CheckCircle2,
    X,
    Loader2,
    Sparkles,
} from "lucide-react";
import { generateAIRecommendations, acceptRecommendation } from "@/app/actions/compass";

interface Recommendation {
    category: string;
    task: string;
    description?: string;
}

interface AIRecommendationsProps {
    userId: string;
    onAccept?: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
    Career: Briefcase,
    Relationships: Heart,
    Health: Activity,
    "Personal Development": Brain,
};

const CATEGORY_COLORS: Record<string, string> = {
    Career: "bg-blue-500",
    Relationships: "bg-pink-500",
    Health: "bg-green-500",
    "Personal Development": "bg-purple-500",
};

export function AIRecommendations({ userId, onAccept }: AIRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
    const [acceptingIds, setAcceptingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadRecommendations();
    }, [userId]);

    const loadRecommendations = async () => {
        setIsLoading(true);
        setError(null);

        const result = await generateAIRecommendations(userId);

        if (result.success) {
            setRecommendations(result.recommendations || []);
        } else {
            setError(result.error || "Failed to load recommendations");
        }

        setIsLoading(false);
    };

    const handleAccept = async (recommendation: Recommendation, index: number) => {
        setAcceptingIds((prev) => new Set(prev).add(index));

        const result = await acceptRecommendation(userId, recommendation);

        if (result.success) {
            // Remove from list after accepting
            setTimeout(() => {
                setDismissedIds((prev) => new Set(prev).add(index));
                setAcceptingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(index);
                    return next;
                });
                onAccept?.();
            }, 500);
        } else {
            setAcceptingIds((prev) => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
            alert("Failed to accept recommendation. Please try again.");
        }
    };

    const handleDismiss = (index: number) => {
        setDismissedIds((prev) => new Set(prev).add(index));
    };

    // Group by category
    const groupedRecommendations = recommendations.reduce((acc, rec, idx) => {
        if (dismissedIds.has(idx)) return acc;
        if (!acc[rec.category]) acc[rec.category] = [];
        acc[rec.category].push({ ...rec, originalIndex: idx });
        return acc;
    }, {} as Record<string, Array<Recommendation & { originalIndex: number }>>);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                >
                    <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Generating personalized recommendations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button
                    onClick={loadRecommendations}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-secondary/30 rounded-xl p-8 text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground mb-4">
                    Complete your personality assessment to get personalized recommendations!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedRecommendations).map(([category, items]) => {
                const Icon = CATEGORY_ICONS[category] || Brain;
                const colorClass = CATEGORY_COLORS[category] || "bg-gray-500";

                return (
                    <div key={category}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg">{category}</h3>
                        </div>

                        <div className="space-y-3">
                            {items.map((rec) => {
                                const isAccepting = acceptingIds.has(rec.originalIndex);

                                return (
                                    <motion.div
                                        key={rec.originalIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 group hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium mb-1">{rec.task}</p>
                                            {rec.description && (
                                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(rec, rec.originalIndex)}
                                                disabled={isAccepting}
                                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                                                title="Accept & add to To-Do"
                                            >
                                                {isAccepting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDismiss(rec.originalIndex)}
                                                disabled={isAccepting}
                                                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                                                title="Dismiss"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {Object.keys(groupedRecommendations).length === 0 && (
                <div className="bg-secondary/30 rounded-xl p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">All Done! 🎉</h3>
                    <p className="text-muted-foreground mb-4">
                        You've reviewed all recommendations. Check back next month for fresh insights!
                    </p>
                    <button
                        onClick={loadRecommendations}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Refresh Recommendations
                    </button>
                </div>
            )}
        </div>
    );
}
