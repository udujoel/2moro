"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OracleChat } from "@/components/oracle/oracle-chat";
import { useState } from "react";
import { Sparkles, Eye, MessageCircle, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OraclePage() {
    const [activeView, setActiveView] = useState<"landing" | "chat" | "vision">("landing");

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-lg">
                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="w-3 h-3 fill-primary text-primary" />
                        </div>
                    </Link>
                </header>

                <main className="flex-1 p-6 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {activeView === "landing" ? (
                            <motion.div
                                key="landing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 flex flex-col"
                            >
                                {/* Hero Section */}
                                <div className="text-center py-12 max-w-2xl mx-auto">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20"
                                    >
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </motion.div>

                                    <motion.h1
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
                                    >
                                        The Oracle
                                    </motion.h1>

                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-lg text-muted-foreground max-w-lg mx-auto"
                                    >
                                        Consult your future self. Gain wisdom from the version of you that has already lived through your current challenges.
                                    </motion.p>
                                </div>

                                {/* CTA Cards */}
                                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full mt-8">
                                    {/* Chat CTA */}
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        onClick={() => setActiveView("chat")}
                                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-left hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <MessageCircle className="w-7 h-7 text-purple-400" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Chat with Future Self</h3>
                                            <p className="text-muted-foreground text-sm mb-4">
                                                Engage in a Socratic dialogue with the wise version of you from 10+ years ahead. Discover insights through thoughtful questions.
                                            </p>
                                            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                                                Start conversation
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Vision CTA */}
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        onClick={() => setActiveView("vision")}
                                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-left hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Eye className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Peep Into Your Future</h3>
                                            <p className="text-muted-foreground text-sm mb-4">
                                                See yourself 20 years from now. AI generates personalized life scenarios based on your current habits and choices.
                                            </p>
                                            <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium group-hover:gap-3 transition-all">
                                                See your future
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.button>
                                </div>

                                {/* Wisdom Quote */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="mt-12 text-center"
                                >
                                    <p className="text-muted-foreground italic text-sm max-w-md mx-auto">
                                        "The best time to plant a tree was 20 years ago. The second best time is now."
                                    </p>
                                </motion.div>
                            </motion.div>
                        ) : activeView === "chat" ? (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 flex flex-col"
                            >
                                {/* Chat Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setActiveView("landing")}
                                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            ← Back
                                        </button>
                                        <div>
                                            <h1 className="text-2xl font-bold">Future Self Dialogue</h1>
                                            <p className="text-sm text-muted-foreground">Wisdom through reflection</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Container */}
                                <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden">
                                    <OracleChat />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="vision"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 flex flex-col"
                            >
                                {/* Vision Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setActiveView("landing")}
                                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            ← Back
                                        </button>
                                        <div>
                                            <h1 className="text-2xl font-bold">Peep Into Your Future</h1>
                                            <p className="text-sm text-muted-foreground">See what awaits</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Coming Soon Placeholder */}
                                <div className="flex-1 bg-card border border-border rounded-2xl flex items-center justify-center">
                                    <div className="text-center p-12">
                                        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
                                            <Eye className="w-10 h-10 text-indigo-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Vision Module</h2>
                                        <p className="text-muted-foreground mb-6 max-w-md">
                                            Upload your photo and see yourself 20 years from now with AI-powered age progression and life scenario projections.
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">
                                            <Sparkles className="w-4 h-4" />
                                            Coming in Phase 2
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
