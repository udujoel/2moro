"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Pause, Play, Square, Volume2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateContentWithFallback } from "@/lib/ai"; // We can't use server logic directly here, need Server Action bridge?
// Actually simpler: pass a server action via props or imported function
import { handleAiQueryAction } from "@/app/actions/dashboard";
// We need a specific action for Q&A. Let's create it later or assume simple hook.
// For now, let's focus on the UI and basic TTS.

interface AudioAgentProps {
    minimal?: boolean;
}

export function AudioAgent({ minimal = false }: AudioAgentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    const handleSummaryClick = () => {
        setIsOpen(true);
        speak("Here is your summary. You have logged 12 memories this week. You seem focused on your career transition. Keep pushing forward.");
    };

    const speak = (text: string) => {
        if (!synthRef.current) return;

        // Cancel existing
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        // utterance.voice = ... select a nice voice if possible

        synthRef.current.speak(utterance);
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            // Stop listening logic mock
            setIsListening(false);
            // Simulate AI process
            handleAiQuery("Simulated Query");
        } else {
            setIsListening(true);
            setTranscript("Listening...");
        }
    };

    const handleAiQuery = async (query: string) => {
        setTranscript("Processing...");
        try {
            const response = await handleAiQueryAction(query);
            setAiResponse(response);
            speak(response);
        } catch (e) {
            console.error(e);
            speak("I'm having trouble connecting to my neural core.");
        }
    };

    return (
        <>
            {/* FAB Pulusating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSummaryClick}
                className={minimal
                    ? "w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    : "fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center group"
                }
            >
                {!minimal && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-40" />}
                <Mic className={minimal ? "w-5 h-5" : "w-6 h-6 relative z-10"} />
            </motion.button>

            {/* Modal / Widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-28 right-8 w-80 md:w-96 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    >
                        <div className="bg-primary/10 p-4 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-primary">
                                <Sparkles className="w-5 h-5" />
                                <span>Soul Assistant</span>
                            </div>
                            <button onClick={() => { stopSpeaking(); setIsOpen(false); }} className="hover:bg-primary/20 p-1 rounded-full text-primary transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-6">

                            {/* Visualizer Circle */}
                            <div className="relative">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking ? "bg-primary animate-pulse shadow-[0_0_40px_rgba(var(--primary),0.5)]" : "bg-muted"}`}>
                                    {isSpeaking ? (
                                        <Volume2 className="w-8 h-8 text-white" />
                                    ) : (
                                        <Mic className="w-8 h-8 text-muted-foreground" />
                                    )}
                                </div>
                                {isSpeaking && (
                                    <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                    {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
                                </p>
                                {aiResponse && (
                                    <p className="text-sm italic text-foreground/80">"{aiResponse}"</p>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4 w-full">
                                <button
                                    onClick={toggleListening}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isListening ? "bg-red-500 text-white" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                                >
                                    {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    {isListening ? "Stop" : "Ask Question"}
                                </button>
                                {isSpeaking && (
                                    <button
                                        onClick={stopSpeaking}
                                        className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                                    >
                                        <Pause className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
