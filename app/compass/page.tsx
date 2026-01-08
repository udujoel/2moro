"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/top-bar";
import { motion } from "framer-motion";
import {
    Brain,
    DollarSign,
    RefreshCw,
    Sparkles,
    TrendingUp,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-provider";
import { getLatestPersonalityTest } from "@/app/actions/compass";
import { AIRecommendations } from "@/components/compass/ai-recommendations";
import { TodoSections } from "@/components/compass/todo-sections";
import { StreakTracker } from "@/components/compass/streak-tracker";
import { InvestmentProjection } from "@/components/compass/investment-projection";
import { PortfolioChart } from "@/components/compass/portfolio-chart";
import { FinancialHealth } from "@/components/compass/financial-health";
import { useSearchParams, useRouter } from "next/navigation";

export default function CompassPage() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [hasPersonalityTest, setHasPersonalityTest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [forceRefresh, setForceRefresh] = useState(false);

    useEffect(() => {
        if (user) {
            checkPersonalityTest();
        }

        // Check for refresh param from assessment completion
        const shouldRefresh = searchParams.get("refresh") === "true";
        if (shouldRefresh) {
            setForceRefresh(true);
            // Clear the param from URL
            router.replace("/compass", { scroll: false });
        }
    }, [user, searchParams]);

    const checkPersonalityTest = async () => {
        if (!user) return;

        setIsLoading(true);
        const result = await getLatestPersonalityTest(user.id);
        setHasPersonalityTest(!!result.test);
        setIsLoading(false);
    };

    const handleTodoUpdate = () => {
        setRefreshTrigger((prev) => prev + 1);
        // Reset forceRefresh after initial load
        if (forceRefresh) setForceRefresh(false);
    };

    if (!user) {
        return (
            <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
                <Sidebar className="hidden md:flex shrink-0 z-30" />
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-muted/10">
                    <TopBar title="The Compass" />
                    <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            <Sidebar className="hidden md:flex shrink-0 z-30" />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-muted/10">
                <TopBar title="The Compass" />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {/* Header */}
                    <div className="max-w-7xl mx-auto mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-6"
                        >
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                Your Life Compass 🧭
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Navigate your personal growth and financial wellness
                            </p>
                        </motion.div>
                    </div>

                    {/* Two-Section Layout */}
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* SECTION 1: Personal Growth */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Personal Growth</h2>
                                        <p className="text-sm text-muted-foreground">
                                            AI-powered insights & actions
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/compass/assessment"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {hasPersonalityTest ? "Redo" : "Take"} Assessment
                                </Link>
                            </div>

                            {/* Personality Test Status */}
                            {!isLoading && !hasPersonalityTest && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">
                                                Get Started with Your Personality Assessment
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                Discover your MBTI type and unlock personalized recommendations
                                                tailored to your unique personality and monthly horoscope.
                                            </p>
                                            <Link
                                                href="/compass/assessment"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                <Brain className="w-4 h-4" />
                                                Start Assessment
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI Recommendations */}
                            {hasPersonalityTest && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            AI Recommendations
                                        </h3>
                                        <button
                                            onClick={() => setForceRefresh(true)}
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
                                            title="Regenerate recommendations"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Regenerate
                                        </button>
                                    </div>
                                    <AIRecommendations
                                        userId={user.id}
                                        onAccept={handleTodoUpdate}
                                        forceRefresh={forceRefresh}
                                        onLoadComplete={() => setForceRefresh(false)}
                                    />
                                </div>
                            )}

                            {/* To-Do Sections */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-4">Your Action Plan</h3>
                                <TodoSections userId={user.id} refreshTrigger={refreshTrigger} />
                            </div>

                            {/* Streak Tracker */}
                            <StreakTracker userId={user.id} refreshTrigger={refreshTrigger} />
                        </motion.div>

                        {/* SECTION 2: Financial Wellness */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Financial Wellness</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Track & optimize your finances
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/compass/financials"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Update Financials
                                </Link>
                            </div>

                            {/* Financial Health Score */}
                            <FinancialHealth userId={user.id} />

                            {/* Investment Projection Calculator */}
                            <InvestmentProjection userId={user.id} />

                            {/* Portfolio/Market Chart */}
                            <PortfolioChart userId={user.id} />
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
