"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Image as ImageIcon, Video, Type, Plus, X, Send } from "lucide-react";

interface OmniJournalProps {
    onNewEntry: (entry: any) => void;
}

export function OmniJournal({ onNewEntry }: OmniJournalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"menu" | "text" | "voice" | "camera">("menu");
    const [textInput, setTextInput] = useState("");

    const handleTextSubmit = () => {
        if (!textInput.trim()) return;
        onNewEntry({
            id: Date.now(),
            type: "text",
            content: textInput,
            date: "Just now",
            chapter: "Chapter 24: The Shift"
        });
        setTextInput("");
        setMode("menu");
        setIsOpen(false);
    };

    const toggleOpen = () => {
        if (isOpen) {
            setIsOpen(false);
            setMode("menu");
        } else {
            setIsOpen(true);
        }
    };

    return (
        <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && mode === "menu" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="mb-4 flex flex-col gap-3 items-end"
                    >
                        <button onClick={() => setMode("text")} className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-lg hover:bg-muted">
                            <span className="text-sm font-medium">Text</span>
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <Type className="w-4 h-4" />
                            </div>
                        </button>
                        <button className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-lg hover:bg-muted">
                            <span className="text-sm font-medium">Voice Note</span>
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300">
                                <Mic className="w-4 h-4" />
                            </div>
                        </button>
                        <button className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-lg hover:bg-muted">
                            <span className="text-sm font-medium">Photo</span>
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                        </button>
                    </motion.div>
                )}

                {isOpen && mode === "text" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mb-4 bg-card border border-border p-4 rounded-2xl shadow-xl w-80 md:w-96"
                    >
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="What's happening?"
                            className="w-full h-32 bg-transparent resize-none outline-none text-base"
                            autoFocus
                        />
                        <div className="flex justify-between items-center mt-2 border-t border-border pt-2">
                            <span className="text-xs text-muted-foreground">Auto-tagged: Today</span>
                            <button
                                onClick={handleTextSubmit}
                                className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={toggleOpen}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? "bg-muted text-foreground rotate-45" : "bg-foreground text-background"
                    }`}
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
}
