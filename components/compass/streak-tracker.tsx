"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import { calculateStreak, getCompletionHeatmap } from "@/app/actions/compass";

interface StreakTrackerProps {
    userId: string;
    refreshTrigger?: number;
}

export function StreakTracker({ userId, refreshTrigger }: StreakTrackerProps) {
    const [streak, setStreak] = useState(0);
    const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [userId, refreshTrigger]);

    const loadData = async () => {
        setIsLoading(true);

        const [streakResult, heatmapResult] = await Promise.all([
            calculateStreak(userId),
            getCompletionHeatmap(userId, new Date().getFullYear()),
        ]);

        if (streakResult.success) {
            setStreak(streakResult.streak);
        }

        if (heatmapResult.success) {
            setHeatmapData(heatmapResult.heatmapData);
        }

        setIsLoading(false);
    };

    // Generate last 30 days for heatmap
    const getLast30Days = () => {
        const days = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }

        return days;
    };

    const days = getLast30Days();

    const getIntensity = (count: number) => {
        if (count === 0) return "bg-secondary";
        if (count === 1) return "bg-green-500/30";
        if (count === 2) return "bg-green-500/50";
        if (count === 3) return "bg-green-500/70";
        return "bg-green-500";
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-secondary rounded w-1/3"></div>
                    <div className="h-20 bg-secondary rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Current Streak</h3>
                        <p className="text-sm text-muted-foreground">Keep it going!</p>
                    </div>
                </div>

                <motion.div
                    key={streak}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-bold text-orange-500"
                >
                    {streak}
                    <span className="text-lg text-muted-foreground ml-1">days</span>
                </motion.div>
            </div>

            {/* Heatmap */}
            <div>
                <p className="text-xs text-muted-foreground mb-3">Last 30 Days</p>
                <div className="grid grid-cols-10 gap-1.5">
                    {days.map((date) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const count = heatmapData[dateKey] || 0;
                        const intensity = getIntensity(count);

                        return (
                            <div
                                key={dateKey}
                                className={`aspect-square rounded ${intensity} transition-colors group relative`}
                                title={`${date.toLocaleDateString()}: ${count} tasks`}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {date.toLocaleDateString()}: {count} tasks
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded bg-secondary"></div>
                        <div className="w-3 h-3 rounded bg-green-500/30"></div>
                        <div className="w-3 h-3 rounded bg-green-500/50"></div>
                        <div className="w-3 h-3 rounded bg-green-500/70"></div>
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
