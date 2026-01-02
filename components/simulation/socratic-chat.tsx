"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function SocraticChat() {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: "Greetings. I am you, from the year 2080. The choices you make today ripple through time to reach me. What is weighing on your mind?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Is this purchase for the person you are today, or the person you are becoming? How does this choice compound over the next decade?"
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full max-h-[600px] md:max-h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm ${msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="flex gap-1 bg-muted px-4 py-3 rounded-2xl rounded-tl-none">
                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Speak to your future self..."
                        className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
