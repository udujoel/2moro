"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Pause, Play, Square, Volume2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleAiQueryAction } from "@/app/actions/dashboard";

interface AudioAgentProps {
    minimal?: boolean;
}

export function AudioAgent({ minimal = false }: AudioAgentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleSummaryClick = () => {
        setIsOpen(true);
        speakWithElevenLabs("Here is your summary. You have logged 12 memories this week. You seem focused on your career transition. Keep pushing forward.");
    };

    const speakWithElevenLabs = async (text: string) => {
        setIsLoading(true);
        setIsSpeaking(true);
        try {
            const response = await fetch('/api/oracle/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('TTS request failed');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
                setIsSpeaking(false);
                console.error("Audio playback error");
            };

            await audio.play();
        } catch (error) {
            console.error("ElevenLabs TTS error:", error);
            setIsSpeaking(false);
            // Fallback to browser TTS if ElevenLabs fails
            if (typeof window !== "undefined" && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const stopSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
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
            await speakWithElevenLabs(response);
        } catch (e) {
            console.error(e);
            speakWithElevenLabs("I'm having trouble connecting to my neural core.");
        }
    };

    return (
        <>
            {/* FAB Pulsating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSummaryClick}
                className={minimal
                    ? "relative w-14 h-14 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    : "fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center group"
                }
            >
                {/* Pulsing rings */}
                <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
                <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />

                {!minimal && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-40" />}
                <Mic className={minimal ? "w-5 h-5 relative z-10" : "w-6 h-6 relative z-10"} />
            </motion.button>

            {/* Modal / Widget - Centered */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={() => { stopSpeaking(); setIsOpen(false); }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="bg-primary/10 p-4 border-b border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold text-primary">
                                        <Sparkles className="w-5 h-5" />
                                        <span>Soul Assistant</span>
                                    </div>
                                    <button onClick={() => { stopSpeaking(); setIsOpen(false); }} className="hover:bg-primary/20 p-1 rounded-full text-primary transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-8 flex flex-col items-center justify-center min-h-[280px] text-center space-y-6">

                                    {/* Visualizer Circle */}
                                    <div className="relative">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isListening
                                                ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                                                : isSpeaking
                                                    ? "bg-primary animate-pulse shadow-[0_0_40px_rgba(var(--primary),0.5)]"
                                                    : "bg-muted"
                                            }`}>
                                            {isListening ? (
                                                <Mic className="w-10 h-10 text-white animate-pulse" />
                                            ) : isSpeaking ? (
                                                <Volume2 className="w-10 h-10 text-white" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-muted-foreground" />
                                            )}
                                        </div>
                                        {(isSpeaking || isListening) && (
                                            <div className={`absolute inset-0 rounded-full border-2 ${isListening ? 'border-red-500/50' : 'border-white/50'} animate-ping`} />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                            {isLoading ? "Processing..." : isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
                                        </p>
                                        {aiResponse && (
                                            <p className="text-sm italic text-foreground/80 max-w-xs">"{aiResponse}"</p>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-4 w-full max-w-xs">
                                        <button
                                            onClick={toggleListening}
                                            disabled={isLoading}
                                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${isListening
                                                    ? "bg-red-500 text-white hover:bg-red-600"
                                                    : "bg-secondary text-foreground hover:bg-secondary/80"
                                                }`}
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
