"use client";

import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { OracleChat } from "@/components/oracle/oracle-chat";
import { ThreeOrb } from "@/components/oracle/three-orb";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Eye, MessageCircle, ChevronRight, Mic, MicOff, Phone, Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/user-provider";

interface ConversationItem {
    id: string;
    type: "text" | "voice";
    summary: string;
    createdAt: Date;
}

interface TranscriptEntry {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function OraclePage() {
    const [activeView, setActiveView] = useState<"landing" | "chat" | "vision" | "voice">("landing");
    const [recentConversations, setRecentConversations] = useState<ConversationItem[]>([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [showAllRecent, setShowAllRecent] = useState(false);
    const { user } = useUser();

    // Voice mode state
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentUserSpeech, setCurrentUserSpeech] = useState("");
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [voiceStatus, setVoiceStatus] = useState("Tap to start speaking");
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInput, setTextInput] = useState("");
    const recognitionRef = useRef<any>(null);

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

    // Initialize speech recognition
    useEffect(() => {
        if (activeView !== "voice") return;

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
                        handleVoiceInput(finalTranscript);
                    }
                };

                recognition.onerror = (event: any) => {
                    if (event.error === 'not-allowed') {
                        setVoiceError('Microphone access denied');
                        setShowTextInput(true);
                    } else if (event.error !== 'no-speech') {
                        setVoiceError('Voice error - try typing');
                        setShowTextInput(true);
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    if (isListening) {
                        try {
                            recognition.start();
                        } catch (e) { }
                    }
                };

                recognitionRef.current = recognition;
            } else {
                setVoiceError('Speech recognition not supported');
                setShowTextInput(true);
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [activeView, isListening]);

    const handleVoiceInput = async (text: string) => {
        const userEntry: TranscriptEntry = {
            id: Date.now().toString(),
            role: "user",
            content: text,
        };

        setTranscript(prev => [...prev, userEntry]);
        setCurrentUserSpeech("");
        setIsProcessing(true);
        setVoiceStatus("Processing...");

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
            };

            setTranscript(prev => [...prev, assistantEntry]);
            setVoiceStatus("Listening...");
            speakResponse(responseText);

        } catch (error) {
            setVoiceError("Failed to get response");
            setVoiceStatus("Error - try again");
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
                setVoiceStatus("Listening...");
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
            setVoiceStatus("Tap to start speaking");
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        } else {
            setVoiceError(null);
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setIsListening(true);
                setVoiceStatus("Listening...");
                if (recognitionRef.current) {
                    recognitionRef.current.start();
                }
            } catch (err) {
                setVoiceError('Unable to access microphone');
                setShowTextInput(true);
            }
        }
    }, [isListening]);

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleVoiceInput(textInput.trim());
            setTextInput("");
        }
    };

    const exitVoiceMode = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        speechSynthesis.cancel();
        setIsListening(false);
        setTranscript([]);
        setActiveView("landing");
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return "Yesterday";
        return `${days}d ago`;
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

    const orbState = isSpeaking ? "speaking" : isListening ? "listening" : "idle";
    const lastEntry = transcript[transcript.length - 1];
    const displayText = currentUserSpeech || lastEntry?.content || "";

    return (
        <div className="flex min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
            <Sidebar className="hidden md:flex border-r border-white/5" />

            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">Dashboard</Link>
                        <span className="text-slate-600">›</span>
                        <span className="text-white font-medium">Oracle</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-6 lg:px-12 py-8 overflow-auto relative">
                    <div className="max-w-7xl mx-auto h-full">
                        <AnimatePresence mode="wait">
                            {activeView === "vision" ? (
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
                                            <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                                                <Eye className="w-10 h-10 text-purple-400" />
                                            </div>
                                            <h2 className="text-3xl font-bold mb-4">Vision Module</h2>
                                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                                Upload a photo to generate a scientifically grounded projection of your appearance 20 years from now.
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20">
                                                <Sparkles className="w-4 h-4" />
                                                Currently under development
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="main"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative"
                                >
                                    {/* Landing Content - Blurs when voice active */}
                                    <div className={`transition-all duration-700 ease-out ${activeView === 'voice' ? 'blur-sm opacity-50 scale-[0.98]' : ''}`}>
                                        {/* Greeting */}
                                        <p className="text-amber-400 text-sm mb-1 font-medium bg-amber-400/10 inline-block px-3 py-1 rounded-full border border-amber-400/20">
                                            {getGreeting()}, {user?.name?.split(" ")[0] || "Susan"} ✨
                                        </p>
                                        <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-4 tracking-tight">
                                            What can I do for you today?!
                                        </h1>

                                        {/* Main Cards Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10 h-auto md:h-[520px]">
                                            {/* Left: Orb Card */}
                                            <button
                                                onClick={() => setActiveView("voice")}
                                                className="md:col-span-3 relative rounded-3xl bg-gradient-to-br from-[#12121a] to-[#0f0f18] border border-slate-800/40 overflow-hidden text-left hover:border-cyan-500/30 transition-all group min-h-[320px] md:h-full"
                                            >
                                                {/* Orb */}
                                                <div className="absolute top-1/2 right-4 sm:right-12 -translate-y-1/2 scale-110">
                                                    <ThreeOrb state="idle" size={500} />
                                                </div>

                                                {/* Text */}
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

                                        {/* Recent Activities */}
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
                                    </div>

                                    {/* Voice Mode Overlay - In-place with visible background */}
                                    <AnimatePresence>
                                        {activeView === "voice" && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-40"
                                            >
                                                {/* Clickable Backdrop */}
                                                <div
                                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                                    onClick={exitVoiceMode}
                                                >
                                                    {/* Close button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            exitVoiceMode();
                                                        }}
                                                        className="absolute top-0 right-0 p-3 text-slate-400 hover:text-white transition-colors z-50"
                                                    >
                                                        <X className="w-6 h-6" />
                                                    </button>

                                                    {/* Content Container - Stop propagation to prevent accidental closing */}
                                                    <div
                                                        className="flex flex-col items-center justify-center w-full h-full pointer-events-none"
                                                    >
                                                        {/* Status */}
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-slate-400 text-sm mb-8 font-medium pointer-events-auto"
                                                        >
                                                            {voiceStatus}
                                                        </motion.p>

                                                        {/* Expanded Orb */}
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.5, opacity: 0 }}
                                                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                                            className="pointer-events-auto"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <ThreeOrb state={orbState} size={600} />
                                                        </motion.div>

                                                        {/* Transcript */}
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="mt-8 text-center max-w-lg px-4 min-h-[80px] pointer-events-auto"
                                                        >
                                                            {displayText ? (
                                                                <p className="text-lg leading-relaxed">
                                                                    <span className="text-white">{displayText.slice(0, Math.ceil(displayText.length * 0.65))}</span>
                                                                    <span className="text-slate-500">{displayText.slice(Math.ceil(displayText.length * 0.65))}</span>
                                                                    {currentUserSpeech && <span className="animate-pulse text-cyan-400">|</span>}
                                                                </p>
                                                            ) : (
                                                                <p className="text-slate-500">Tap the microphone to begin your conversation</p>
                                                            )}
                                                        </motion.div>

                                                        {/* Error */}
                                                        {voiceError && (
                                                            <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm pointer-events-auto"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {voiceError}
                                                            </div>
                                                        )}

                                                        {/* Text input fallback */}
                                                        {showTextInput && (
                                                            <form
                                                                onSubmit={handleTextSubmit}
                                                                className="mt-6 w-full max-w-md px-4 pointer-events-auto"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={textInput}
                                                                        onChange={(e) => setTextInput(e.target.value)}
                                                                        placeholder="Type your message..."
                                                                        className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={!textInput.trim() || isProcessing}
                                                                        className="px-5 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50"
                                                                    >
                                                                        Send
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}

                                                        {/* Controls */}
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 }}
                                                            className="mt-10 flex items-center gap-6 pointer-events-auto"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={exitVoiceMode}
                                                                className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                                                            >
                                                                <Phone className="w-5 h-5 text-red-400 rotate-[135deg]" />
                                                            </button>

                                                            <button
                                                                onClick={toggleListening}
                                                                disabled={isProcessing}
                                                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening
                                                                        ? "bg-white text-slate-900 shadow-white/20"
                                                                        : "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:border-cyan-500/50 shadow-cyan-500/10"
                                                                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            >
                                                                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                                            </button>

                                                            <button
                                                                onClick={() => setShowTextInput(!showTextInput)}
                                                                className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${showTextInput
                                                                        ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                                                                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white"
                                                                    }`}
                                                            >
                                                                <Keyboard className="w-5 h-5" />
                                                            </button>
                                                        </motion.div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                exitVoiceMode();
                                                            }}
                                                            className="mt-6 text-sm text-slate-600 hover:text-slate-400 transition-colors pointer-events-auto"
                                                        >
                                                            End conversation
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Chat Sidebar */}
                                    <AnimatePresence>
                                        {activeView === "chat" && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                                                    onClick={() => setActiveView("landing")}
                                                />
                                                <motion.div
                                                    initial={{ x: "100%" }}
                                                    animate={{ x: 0 }}
                                                    exit={{ x: "100%" }}
                                                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                                    className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#0a0a0f] border-l border-slate-800 z-50 flex flex-col shadow-2xl"
                                                >
                                                    <OracleChat onClose={() => setActiveView("landing")} />
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
