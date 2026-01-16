"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import {
    getLatestFinancialSnapshot,
    generateFinancialAnalysis,
} from "@/app/actions/compass";
import { getHealthRating } from "@/lib/finance";

interface FinancialHealthProps { }

export function FinancialHealth({ }: FinancialHealthProps) {
    const [snapshot, setSnapshot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadSnapshot();
    }, []);

    const loadSnapshot = async () => {
        setIsLoading(true);
        const result = await getLatestFinancialSnapshot();
        if (result.success && result.snapshot) {
            setSnapshot(result.snapshot);

            // If no AI analysis yet, generate it
            if (!result.snapshot.healthScore) {
                await analyzeFinancials();
            }
        }
        setIsLoading(false);
    };

    const analyzeFinancials = async () => {
        setIsAnalyzing(true);
        const result = await generateFinancialAnalysis();
        if (result.success) {
            // Reload snapshot to get updated data
            const updated = await getLatestFinancialSnapshot();
            if (updated.success) {
                setSnapshot(updated.snapshot);
            }
        }
        setIsAnalyzing(false);
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-secondary rounded w-1/3"></div>
                    <div className="h-24 bg-secondary rounded"></div>
                </div>
            </div>
        );
    }

    if (!snapshot) {
        return (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Financial Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                    Update your financials to get AI-powered insights
                </p>
            </div>
        );
    }

    const healthScore = snapshot.healthScore || 0;
    const rating = getHealthRating(healthScore);
    const recommendations = snapshot.recommendations || [];

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Financial Health</h3>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(snapshot.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {!snapshot.healthScore && (
                    <button
                        onClick={analyzeFinancials}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                    >
                        {isAnalyzing ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                </motion.div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Get AI Analysis
                            </>
                        )}
                    </button>
                )}
            </div>

            {snapshot.healthScore ? (
                <>
                    {/* Health Score */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Health Score</span>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold">{healthScore}</span>
                                <span className="text-muted-foreground">/100</span>
                            </div>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${healthScore}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${healthScore >= 80
                                    ? "bg-green-500"
                                    : healthScore >= 60
                                        ? "bg-blue-500"
                                        : healthScore >= 40
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                    }`}
                            />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-2xl">{rating.emoji}</span>
                            <span className={`font-semibold ${rating.color}`}>
                                {rating.label}
                            </span>
                        </div>
                    </div>

                    {/* AI Summary */}
                    {snapshot.aiReport && (
                        <div className="mb-6 p-4 bg-secondary/30 rounded-xl">
                            <p className="text-sm">{snapshot.aiReport}</p>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                AI Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {recommendations.map((rec: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{rec}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        Click "Get AI Analysis" to receive personalized financial insights
                    </p>
                </div>
            )}
        </div>
    );
}
