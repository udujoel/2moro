"use client";

import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { OracleChat } from "@/components/oracle/oracle-chat";
import { ThreeOrb } from "@/components/oracle/three-orb";
import { OracleVoice } from "@/components/oracle/oracle-voice";
import { useState, useEffect } from "react";
import { Sparkles, Eye, MessageCircle, ChevronRight, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/user-provider";

interface ConversationItem {
    id: string;
    type: "text" | "voice";
    summary: string;
    createdAt: Date;
}

export default function OraclePage() {
    const [activeView, setActiveView] = useState<"landing" | "chat" | "vision" | "voice">("landing");
    const [recentConversations, setRecentConversations] = useState<ConversationItem[]>([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [showAllRecent, setShowAllRecent] = useState(false);
    const { user } = useUser();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    useEffect(() => {
        async function fetchRecent() {
            try {
                const res = await fetch("/api/oracle/recent");
                if (res.ok) {
                    const data = await res.json();
                    setRecentConversations(data.conversations || []);
                }
            } catch (e) {
                console.log("Could not fetch recent conversations");
            } finally {
                setIsLoadingRecent(false);
            }
        }
        fetchRecent();
    }, [activeView]);

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days === 1) return "Yesterday";
        return `${days} days ago`;
    };

    const getIconForType = (type: string, index: number) => {
        const icons = [Mic, MessageCircle, Sparkles];
        const colors = ["text-cyan-400", "text-slate-400", "text-amber-400"];
        const bgColors = ["bg-cyan-500/20", "bg-slate-500/20", "bg-amber-500/20"];

        const Icon = type === "voice" ? Mic : icons[index % icons.length];
        const colorClass = type === "voice" ? "text-cyan-400" : colors[index % colors.length];
        const bgClass = type === "voice" ? "bg-cyan-500/20" : bgColors[index % bgColors.length];

        return { Icon, colorClass, bgClass };
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0f] text-white">
            <Sidebar className="hidden md:flex border-r border-white/5" />

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">Dashboard</Link>
                        <span className="text-slate-600">›</span>
                        <span className="text-white font-medium">Oracle</span>
                    </div>

                </header>

                {/* Main Content */}
                <main className="flex-1 px-6 lg:px-12 py-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            {activeView === "landing" ? (
                                <motion.div
                                    key="landing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Greeting */}
                                    <p className="text-amber-400 text-sm mb-1 font-medium bg-amber-400/10 inline-block px-3 py-1 rounded-full border border-amber-400/20">
                                        {getGreeting()}, {user?.name?.split(" ")[0] || "Susan"} ✨
                                    </p>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-4 tracking-tight">
                                        What can I do for you today?!
                                    </h1>

                                    {/* Main Cards Row - Horizontal Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10 h-auto md:h-[520px]">
                                        {/* Left: Orb Card (Full Height) */}
                                        <button
                                            onClick={() => setActiveView("voice")}
                                            className="md:col-span-3 relative rounded-3xl bg-gradient-to-br from-[#12121a] to-[#0f0f18] border border-slate-800/40 overflow-hidden text-left hover:border-cyan-500/30 transition-all group min-h-[320px] md:h-full"
                                        >
                                            {/* Orb - Larger and Centered vertically on right */}
                                            <div className="absolute top-1/2 right-4 sm:right-12 -translate-y-1/2 scale-110">
                                                <ThreeOrb
                                                    state="idle"
                                                    size={500}
                                                />
                                            </div>

                                            {/* Text - Vertically centered on left */}
                                            <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 max-w-[200px] md:max-w-[260px] z-10">
                                                <h3 className="text-3xl md:text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                                    Something on your mind?
                                                </h3>
                                                <p className="text-slate-500 mt-6 text-sm font-medium flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                                                    Click to talk to Future Self. <Mic className="w-4 h-4 ml-1" />
                                                </p>
                                            </div>
                                        </button>

                                        {/* Right: Stacked Action Cards */}
                                        <div className="md:col-span-2 flex flex-col gap-6 h-full">
                                            {/* Top: Chat Card */}
                                            <button
                                                onClick={() => setActiveView("chat")}
                                                className="flex-1 relative rounded-3xl bg-gradient-to-br from-[#12121a] to-[#0f0f18] border border-slate-800/40 p-8 text-left hover:border-blue-500/30 transition-all group flex flex-col justify-between min-h-[220px] md:min-h-0"
                                            >
                                                <div className="flex items-start justify-between w-full">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                                                        <MessageCircle className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-blue-500/20 transition-all">
                                                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2">Chat with Future Self</h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2">Gain wisdom and perspective by conversing with your future self.</p>
                                                </div>
                                            </button>

                                            {/* Bottom: Vision Card */}
                                            <button
                                                onClick={() => setActiveView("vision")}
                                                className="flex-1 relative rounded-3xl bg-gradient-to-br from-[#12121a] to-[#0f0f18] border border-slate-800/40 p-8 text-left hover:border-amber-500/30 transition-all group flex flex-col justify-between"
                                            >
                                                <div className="flex items-start justify-between w-full">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                                        <Sparkles className="w-6 h-6 text-amber-400" />
                                                    </div>
                                                    <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-amber-500/20 transition-all">
                                                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2">Peep into the Future</h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2">Visualize your potential path 20 years from now.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recent Activities - Grid Layout now instead of list for better horizonal vibe */}
                                    <div className="mt-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                                                Recent Activities
                                            </h2>
                                            {recentConversations.length > 3 && (
                                                <button
                                                    onClick={() => setShowAllRecent(!showAllRecent)}
                                                    className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                                                >
                                                    {showAllRecent ? "Show less" : "See all"} <ChevronRight className={`w-4 h-4 transition-transform ${showAllRecent ? "rotate-90" : ""}`} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {isLoadingRecent ? (
                                                <>
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-[#12121a] animate-pulse h-32">
                                                            <div className="w-10 h-10 rounded-full bg-slate-800" />
                                                            <div className="h-4 bg-slate-800 rounded w-3/4 mt-auto" />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : recentConversations.length > 0 ? (
                                                recentConversations.slice(0, showAllRecent ? undefined : 3).map((conv, index) => {
                                                    const { Icon, colorClass, bgClass } = getIconForType(conv.type, index);
                                                    return (
                                                        <button
                                                            key={conv.id}
                                                            onClick={() => setActiveView("chat")}
                                                            className="flex flex-col justify-between p-5 rounded-2xl bg-[#12121a] border border-slate-800/30 hover:bg-[#16161f] transition-all text-left group h-36"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
                                                                    <Icon className={`w-5 h-5 ${colorClass}`} />
                                                                </div>
                                                                <span className="text-xs text-slate-600 bg-slate-900/50 px-2 py-1 rounded-full">
                                                                    {formatTimeAgo(conv.createdAt)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium line-clamp-2 text-slate-200 group-hover:text-white transition-colors">{conv.summary}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-span-3 p-8 rounded-2xl border border-dashed border-slate-800 text-center">
                                                    <p className="text-slate-600">
                                                        No conversations yet. Start exploring by clicking the orb!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : activeView === "chat" ? (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[calc(100vh-120px)] flex flex-col"
                                >
                                    {/* Chat view header and content... keeping same structure but centered */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <button
                                            onClick={() => setActiveView("landing")}
                                            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                        <div>
                                            <h1 className="text-2xl font-bold">Chat with Future Self</h1>
                                            <p className="text-sm text-slate-500">Wisdom through reflection</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-[#12121a] border border-slate-800/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                                        <OracleChat />
                                    </div>
                                </motion.div>
                            ) : activeView === "voice" ? (
                                <OracleVoice
                                    onClose={() => setActiveView("landing")}
                                    onSwitchToText={() => setActiveView("chat")}
                                />
                            ) : (
                                <motion.div
                                    key="vision"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[calc(100vh-120px)] flex flex-col"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <button
                                            onClick={() => setActiveView("landing")}
                                            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                        <div>
                                            <h1 className="text-2xl font-bold">Peep Into Your Future</h1>
                                            <p className="text-sm text-slate-500">AI-powered timeline projection</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-[#12121a] border border-slate-800/40 rounded-3xl flex items-center justify-center p-8">
                                        <div className="text-center max-w-lg">
                                            <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]">
                                                <Eye className="w-10 h-10 text-purple-400" />
                                            </div>
                                            <h2 className="text-3xl font-bold mb-4">Vision Module</h2>
                                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                                Upload a photo to generate a scientifically grounded projection of your appearance and environment 20 years from now.
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20">
                                                <Sparkles className="w-4 h-4" />
                                                Currently under development
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
