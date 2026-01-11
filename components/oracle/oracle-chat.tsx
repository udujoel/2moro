"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Mic, Sparkles, Copy, ThumbsUp, ThumbsDown, ChevronLeft, MoreVertical, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-provider";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    images?: string[];
}

const INITIAL_GREETING = {
    title: "Welcome, traveler",
    content: `I am the version of you that exists beyond this moment — shaped by the choices you're about to make and the wisdom you'll gather along the way.

I'm here not to give you answers, but to help you discover them. What's weighing on your mind today?`
};

interface OracleChatProps {
    onClose?: () => void;
}

export function OracleChat({ onClose }: OracleChatProps) {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial",
            role: "assistant",
            content: INITIAL_GREETING.content,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/oracle/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    userId: user?.id,
                }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                assistantContent += chunk;

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMessage.id
                            ? { ...m, content: assistantContent }
                            : m
                    )
                );
            }
        } catch (error) {
            console.error("Oracle chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "I sense some turbulence in our connection. Let's try again in a moment.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a12] to-[#0f0f1a]">
            {/* Header - Phone Style */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#0a0a12]/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Future Self</h2>
                        <p className="text-xs text-slate-500">Always here for you</p>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "flex gap-3",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {/* Assistant Message */}
                            {message.role === "assistant" && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs text-slate-500">Future Self</span>
                                        <div className="relative rounded-2xl rounded-tl-md bg-[#1a1a2e] border-l-4 border-cyan-500/50 px-4 py-3">
                                            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 px-1">
                                            <button
                                                onClick={() => copyMessage(message.content)}
                                                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all">
                                                <ThumbsUp className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                                                <ThumbsDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Message */}
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
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-6 overflow-hidden">
                                        {user?.image ? (
                                            <img src={user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-medium text-white">
                                                {user?.name?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md bg-[#1a1a2e] border-l-4 border-cyan-500/50 px-4 py-3">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Phone Style */}
            <div className="px-4 py-3 border-t border-white/5 bg-[#0a0a12]/80 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <button
                        type="button"
                        className="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        />
                    </div>

                    <button
                        type="button"
                        className="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                    >
                        <Mic className="w-5 h-5" />
                    </button>

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue-500/40 transition-all"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
                <p className="text-[10px] text-slate-600 text-center mt-2">
                    Your future self speaks through wisdom, not certainty
                </p>
            </div>
        </div>
    );
}
