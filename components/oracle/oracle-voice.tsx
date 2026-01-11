"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Phone, Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThreeOrb } from "./three-orb";

interface TranscriptEntry {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface OracleVoiceProps {
    onClose: () => void;
    onSwitchToText: () => void;
}

export function OracleVoice({ onClose, onSwitchToText }: OracleVoiceProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentUserSpeech, setCurrentUserSpeech] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Tap the microphone to start");
    const [textInput, setTextInput] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);

    const recognitionRef = useRef<any>(null);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            finalTranscript += result[0].transcript;
                        } else {
                            interimTranscript += result[0].transcript;
                        }
                    }

                    setCurrentUserSpeech(interimTranscript || finalTranscript);

                    if (finalTranscript) {
                        handleUserInput(finalTranscript);
                    }
                };

                recognition.onerror = (event: any) => {
                    switch (event.error) {
                        case 'not-allowed':
                            setError('Microphone access denied');
                            setIsListening(false);
                            setShowTextInput(true);
                            break;
                        case 'network':
                            setError('Network error - use text input');
                            setIsListening(false);
                            setShowTextInput(true);
                            break;
                        case 'no-speech':
                            break;
                        case 'audio-capture':
                            setError('No microphone found');
                            setIsListening(false);
                            setShowTextInput(true);
                            break;
                        case 'aborted':
                            setIsListening(false);
                            break;
                        default:
                            setIsListening(false);
                            setShowTextInput(true);
                    }
                };

                recognition.onend = () => {
                    if (isListening) {
                        try {
                            recognition.start();
                        } catch (e) {
                            // Ignore
                        }
                    }
                };

                recognitionRef.current = recognition;
            } else {
                setError('Speech recognition not supported');
                setShowTextInput(true);
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening]);

    const handleUserInput = async (text: string) => {
        const userEntry: TranscriptEntry = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date()
        };

        setTranscript(prev => [...prev, userEntry]);
        setCurrentUserSpeech("");
        setIsProcessing(true);
        setStatus("Processing...");

        try {
            const response = await fetch("/api/oracle/voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...transcript, userEntry].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) throw new Error("Failed to get response");

            const responseText = await response.text();

            const assistantEntry: TranscriptEntry = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseText,
                timestamp: new Date()
            };

            setTranscript(prev => [...prev, assistantEntry]);
            setStatus("Go ahead! I'm listening");
            speakResponse(responseText);

        } catch (error) {
            setError("Failed to get response");
            setStatus("Error - try again");
        } finally {
            setIsProcessing(false);
        }
    };

    const speakResponse = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;

            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Samantha') ||
                v.name.includes('Alex') ||
                v.lang.startsWith('en')
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => {
                setIsSpeaking(false);
                setStatus("Go ahead! I'm listening");
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
            };

            speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = useCallback(async () => {
        if (isListening) {
            setIsListening(false);
            setStatus("Tap the microphone to start");
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        } else {
            setError(null);
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setIsListening(true);
                setStatus("Go ahead! I'm listening");
                if (recognitionRef.current) {
                    recognitionRef.current.start();
                }
            } catch (err) {
                setError('Unable to access microphone');
                setShowTextInput(true);
            }
        }
    }, [isListening]);

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleUserInput(textInput.trim());
            setTextInput("");
        }
    };

    const endConversation = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        speechSynthesis.cancel();
        onClose();
    };

    const orbState = isSpeaking ? "speaking" : isListening ? "listening" : "idle";
    const lastEntry = transcript[transcript.length - 1];
    const displayText = currentUserSpeech || lastEntry?.content || "";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-500"
                onClick={endConversation}
            />

            {/* Radial gradient background - subtle glow */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 35%, rgba(6,182,212,0.15), transparent 60%)"
                }}
            />

            {/* Close button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={endConversation}
                    className="p-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-40 px-6 w-full max-w-4xl mx-auto">
                {/* Status text */}
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-400 text-sm mb-12 font-medium tracking-wide"
                >
                    {status}
                </motion.p>

                {/* 3D Orb - with layoutId wrapper for transition */}
                <motion.div
                    layoutId="oracle-orb"
                    className="relative z-50 mb-8"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                >
                    <ThreeOrb
                        state={orbState}
                        size={400}
                    />
                </motion.div>

                {/* Transcript */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-14 text-center max-w-lg min-h-[120px] px-4"
                >
                    {displayText ? (
                        <p className="text-xl leading-relaxed">
                            <span className="text-white">
                                {displayText.slice(0, Math.ceil(displayText.length * 0.65))}
                            </span>
                            <span className="text-slate-500">
                                {displayText.slice(Math.ceil(displayText.length * 0.65))}
                            </span>
                            {currentUserSpeech && <span className="animate-pulse text-cyan-400">|</span>}
                        </p>
                    ) : (
                        <p className="text-slate-600">
                            Tap the microphone to begin your conversation
                        </p>
                    )}
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Text input fallback */}
                <AnimatePresence>
                    {showTextInput && (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleTextSubmit}
                            className="mt-6 w-full max-w-md"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!textInput.trim() || isProcessing}
                                    className="px-5 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pb-10 flex flex-col items-center gap-6 relative z-10"
            >
                <div className="flex items-center gap-6">
                    {/* End call */}
                    <button
                        onClick={endConversation}
                        className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors group"
                    >
                        <Phone className="w-5 h-5 text-red-400 rotate-[135deg] group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Main mic button */}
                    <button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg shadow-cyan-500/20",
                            isListening
                                ? "bg-white text-slate-900"
                                : "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white",
                            isProcessing && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isListening ? (
                            <MicOff className="w-6 h-6" />
                        ) : (
                            <Mic className="w-6 h-6" />
                        )}
                    </button>

                    {/* Keyboard toggle */}
                    <button
                        onClick={() => setShowTextInput(!showTextInput)}
                        className={cn(
                            "w-14 h-14 rounded-full border flex items-center justify-center transition-colors group",
                            showTextInput
                                ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                        )}
                    >
                        <Keyboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <button
                    onClick={endConversation}
                    className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
                >
                    End conversation
                </button>
            </motion.div>
        </motion.div>
    );
}
