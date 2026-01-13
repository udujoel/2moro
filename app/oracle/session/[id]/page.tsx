"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Mic, MessageCircle, Sparkles, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

interface Conversation {
    id: string;
    type: string;
    summary: string;
    messages: Message[];
    createdAt: string;
    user?: {
        name: string;
        avatar?: string;
    };
}

export default function SessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchConversation() {
            try {
                const res = await fetch(`/api/oracle/conversations/${params.id}`);
                if (!res.ok) throw new Error("Failed to fetch conversation");
                const data = await res.json();
                setConversation(data.conversation);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }

        if (params.id) {
            fetchConversation();
        }
    }, [params.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading conversation...</div>
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error || "Conversation not found"}</p>
                <button
                    onClick={() => router.push("/simulation")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                >
                    Back to Oracle
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] to-[#0f0f1a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-10 px-6 py-4 bg-[#0a0a12]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.push("/simulation")}
                        className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conversation.type === "voice" ? "bg-cyan-500/20" : "bg-blue-500/20"
                            }`}>
                            {conversation.type === "voice" ? (
                                <Mic className="w-5 h-5 text-cyan-400" />
                            ) : (
                                <MessageCircle className="w-5 h-5 text-blue-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="font-semibold">
                                {conversation.type === "voice" ? "Voice Session" : "Chat Session"}
                            </h1>
                            <p className="text-xs text-slate-500">{formatDate(conversation.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {conversation.messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs text-slate-500">Future Self</span>
                                        <div className="rounded-2xl rounded-tl-md bg-[#1a1a2e] border-l-4 border-cyan-500/50 px-4 py-3">
                                            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => copyMessage(message.content)}
                                            className="self-start p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {message.role === "user" && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xs text-slate-500">You</span>
                                        <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3 shadow-lg shadow-blue-500/20">
                                            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
