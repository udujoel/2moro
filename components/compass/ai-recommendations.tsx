"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Heart,
    Activity,
    Brain,
    CheckCircle2,
    X,
    Loader2,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Zap,
} from "lucide-react";
import { generateAIRecommendations, acceptRecommendation, dismissRecommendation } from "@/app/actions/compass";

interface Recommendation {
    id?: string;
    category: string;
    task: string;
    description?: string | null;
}

interface AIRecommendationsProps {
    userId: string;
    onAccept?: () => void;
    forceRefresh?: boolean;
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

const CATEGORY_TEXT_COLORS: Record<string, string> = {
    Career: "text-blue-500",
    Relationships: "text-pink-500",
    Health: "text-green-500",
    "Personal Development": "text-purple-500",
};

export function AIRecommendations({ userId, onAccept, forceRefresh = false }: AIRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
    const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
    const [isExpanded, setIsExpanded] = useState(true);
    const [isCached, setIsCached] = useState(false);

    useEffect(() => {
        loadRecommendations(forceRefresh);
    }, [userId, forceRefresh]);

    const loadRecommendations = async (force: boolean = false) => {
        setIsLoading(true);
        setError(null);

        const result = await generateAIRecommendations(userId, force);

        if (result.success) {
            setRecommendations(result.recommendations || []);
            setIsCached(result.cached || false);
        } else {
            setError(result.error || "Failed to load recommendations");
        }

        setIsLoading(false);
    };

    const handleAccept = async (recommendation: Recommendation) => {
        const recId = recommendation.id || `temp-${Date.now()}`;
        setAcceptingIds((prev) => new Set(prev).add(recId));

        const result = await acceptRecommendation(userId, recommendation);

        if (result.success) {
            // Remove from list after accepting
            setTimeout(() => {
                setRecommendations((prev) => prev.filter((r) => r.id !== recommendation.id));
                setAcceptingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(recId);
                    return next;
                });
                onAccept?.();
            }, 500);
        } else {
            setAcceptingIds((prev) => {
                const next = new Set(prev);
                next.delete(recId);
                return next;
            });
            alert("Failed to adopt recommendation. Please try again.");
        }
    };

    const handleDismiss = async (recommendation: Recommendation) => {
        if (!recommendation.id) {
            // For non-persisted recommendations, just remove from UI
            setRecommendations((prev) => prev.filter((r) => r.task !== recommendation.task));
            return;
        }

        setDismissingIds((prev) => new Set(prev).add(recommendation.id!));

        const result = await dismissRecommendation(recommendation.id);

        if (result.success) {
            setRecommendations((prev) => prev.filter((r) => r.id !== recommendation.id));
        }

        setDismissingIds((prev) => {
            const next = new Set(prev);
            next.delete(recommendation.id!);
            return next;
        });
    };

    // Group by category
    const groupedRecommendations = recommendations.reduce((acc, rec) => {
        if (!acc[rec.category]) acc[rec.category] = [];
        acc[rec.category].push(rec);
        return acc;
    }, {} as Record<string, Recommendation[]>);

    // Get category counts for collapsed summary
    const categoryCounts = Object.entries(groupedRecommendations).map(([category, items]) => ({
        category,
        count: items.length,
        color: CATEGORY_TEXT_COLORS[category] || "text-gray-500",
        Icon: CATEGORY_ICONS[category] || Brain,
    }));

    const totalRemaining = categoryCounts.reduce((sum, c) => sum + c.count, 0);

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
                <p className="text-muted-foreground">
                    {forceRefresh ? "Generating fresh recommendations..." : "Loading recommendations..."}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button
                    onClick={() => loadRecommendations(true)}
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
        <div className="space-y-4">
            {/* Guidance Text */}
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                    Click <span className="text-primary font-medium">Adopt</span> to adopt a recommendation.
                    It will be broken down into practical, atomic steps and integrated into your Action Plan.
                    {isCached && (
                        <span className="text-xs text-muted-foreground/70 ml-1">(cached)</span>
                    )}
                </p>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 overflow-hidden"
                    >
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
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                            {items.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map((rec, idx) => {
                                            const recKey = rec.id || `${category}-${idx}`;
                                            const isAccepting = acceptingIds.has(rec.id || recKey);
                                            const isDismissing = dismissingIds.has(rec.id || "");

                                            return (
                                                <motion.div
                                                    key={recKey}
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

                                                    <div className="flex gap-2 items-center">
                                                        <button
                                                            onClick={() => handleAccept(rec)}
                                                            disabled={isAccepting || isDismissing}
                                                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                                        >
                                                            {isAccepting ? (
                                                                <>
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    Adopting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Adopt
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDismiss(rec)}
                                                            disabled={isAccepting || isDismissing}
                                                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                                                            title="Dismiss"
                                                        >
                                                            {isDismissing ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <X className="w-4 h-4" />
                                                            )}
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
                                    You've reviewed all recommendations. Redo your assessment to get fresh insights!
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapse/Expand Toggle */}
            {totalRemaining > 0 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-t border-border"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Collapse Recommendations
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Show {totalRemaining} Recommendations: </span>
                            <span className="flex items-center gap-2">
                                {categoryCounts.map(({ category, count, color, Icon }) => (
                                    <span key={category} className={`flex items-center gap-1 ${color}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {count}
                                    </span>
                                ))}
                            </span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
