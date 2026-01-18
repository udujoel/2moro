"use client";

import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { OracleChat } from "@/components/oracle/oracle-chat";
import { ThreeOrb } from "@/components/oracle/three-orb";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Eye, MessageCircle, ChevronRight, Mic, MicOff, Phone, X, SendHorizonal, Settings, Download, Upload, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/user-provider";
import { GeminiLiveClient, createGeminiLiveClient, getAudioInputDevices, AudioInputDevice } from "@/lib/gemini-live-client";
import { generateFutureBlueprintPDF } from "@/lib/future-pdf";

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

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 30); // Adjust typing speed here
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text]);

    return <span>{displayedText}</span>;
};

// Helper to strip markdown formatting and meta-reasoning from text responses
const stripMarkdown = (text: string): string => {
    // First, remove meta-reasoning patterns (internal model thoughts)
    let cleaned = text
        // Remove common meta-reasoning sentence starters
        .replace(/^(I'm thinking about|I'm considering|Analyzing|Defining|Addressing|Acknowledging|Embracing|Focusing on|Looking at|Let me think|Thinking about|I want to|I need to|Now I'll|First I'll).*?[.!?]\s*/gim, '')
        // Remove blocks that look like internal reasoning (capitalized titles)
        .replace(/^[A-Z][a-zA-Z\s]+(?:ing|tion|ness|ment)[\s:]+.*?[.!?]\s*/gm, '')
        // Remove "I'm [verb]ing..." patterns at start of sentences
        .replace(/(?:^|\.\s+)I'm\s+\w+ing\s+(about|how|what|the|a|an)\s+[^.!?]+[.!?]\s*/gi, '. ')
        // Remove meta sentences about framing/structuring response
        .replace(/(?:^|\.\s+)(?:I'll|I will|Let me|I should)\s+(?:start|begin|frame|structure|focus|try|address|respond).*?[.!?]\s*/gi, '. ')
        // Remove quotes around internal thought expressions
        .replace(/"[^"]*(?:I'm|I'll|I want to|thinking|focusing)[^"]*"/gi, '');

    // Then apply standard markdown stripping
    return cleaned
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italic
        .replace(/`(.*?)`/g, '$1')       // Code
        .replace(/^#+\s*/gm, '')         // Headers
        .replace(/^[-*]\s+/gm, '')       // Lists
        .replace(/^\d+\.\s+/gm, '')      // Numbered lists
        .replace(/\n+/g, ' ')            // Multiple newlines to space
        .replace(/\s{2,}/g, ' ')         // Multiple spaces to single
        .replace(/^\.\s+/, '')           // Leading period
        .trim();
};

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
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const geminiClientRef = useRef<GeminiLiveClient | null>(null);
    const [isLiveConnected, setIsLiveConnected] = useState(false);

    // AssemblyAI WebSocket for speech-to-text
    const assemblyWsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Microphone device selection
    const [audioDevices, setAudioDevices] = useState<AudioInputDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [showDeviceSelector, setShowDeviceSelector] = useState(false);

    // Future vision state
    const [futureData, setFutureData] = useState<{
        scenarios: any[];
        wisdomContent: string;
        createdAt: string;
    } | null>(null);
    const [isLoadingVision, setIsLoadingVision] = useState(false);
    const [visionError, setVisionError] = useState<string | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<number>(1); // 0=optimistic, 1=current, 2=warning
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [scenarioImages, setScenarioImages] = useState<string[]>([]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Default placeholder images for scenarios
    const defaultScenarioImages = [
        '/images/future-scenarios/optimistic.jpg',
        '/images/future-scenarios/current.jpg',
        '/images/future-scenarios/warning.jpg'
    ];

    // Auto-scroll to bottom of transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript, currentUserSpeech]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const userId = user?.id;

    useEffect(() => {
        async function fetchRecent() {
            if (!userId) return;
            try {
                const res = await fetch(`/api/oracle/recent?userId=${userId}`);
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
    }, [activeView, userId]);

    // Fetch existing vision when entering vision view
    useEffect(() => {
        if (activeView === "vision" && !futureData && !isLoadingVision) {
            fetchExistingVision();
        }
    }, [activeView]);

    // Initialize Gemini Live client and load audio devices
    useEffect(() => {
        if (activeView !== "voice") return;

        // Load available audio devices
        const loadDevices = async () => {
            const devices = await getAudioInputDevices();
            setAudioDevices(devices);
            console.log("[Oracle] Available audio devices:", devices);

            // Try to find a default Mac microphone (not iPhone/iPad)
            const macMic = devices.find(d =>
                !d.label.toLowerCase().includes('iphone') &&
                !d.label.toLowerCase().includes('ipad') &&
                !d.label.toLowerCase().includes('airpods') &&
                (d.label.toLowerCase().includes('macbook') ||
                    d.label.toLowerCase().includes('built-in') ||
                    d.label.toLowerCase().includes('internal'))
            );

            if (macMic && !selectedDeviceId) {
                console.log("[Oracle] Auto-selecting Mac microphone:", macMic.label);
                setSelectedDeviceId(macMic.deviceId);
            } else if (devices.length > 0 && !selectedDeviceId) {
                // Default to first device if no Mac mic found
                setSelectedDeviceId(devices[0].deviceId);
            }
        };

        loadDevices();

        // Create Gemini Live client with callbacks
        const client = createGeminiLiveClient({
            onConnect: () => {
                console.log("[Oracle] Gemini Live connected");
                setIsLiveConnected(true);
                setVoiceStatus("Connected - Tap mic to speak");
            },
            onDisconnect: () => {
                console.log("[Oracle] Gemini Live disconnected");
                setIsLiveConnected(false);
            },
            onSpeakingStart: () => {
                setIsSpeaking(true);
                setVoiceStatus("Oracle is speaking...");
            },
            onSpeakingEnd: () => {
                setIsSpeaking(false);
                setVoiceStatus(isListening ? "Listening..." : "Tap to start speaking");
            },
            onError: (error) => {
                console.error("[Oracle] Gemini Live error:", error);
                setVoiceError(error);
            },
            onInterrupted: () => {
                console.log("[Oracle] Playback interrupted");
                setIsSpeaking(false);
            }
        });

        geminiClientRef.current = client;

        // Connect to the Live API
        client.connect().catch((err) => {
            console.error("[Oracle] Failed to connect:", err);
            setVoiceError("Failed to connect to Oracle");
        });

        setVoiceStatus("Tap to start speaking");

        // Cleanup on unmount
        return () => {
            if (geminiClientRef.current) {
                geminiClientRef.current.disconnect();
                geminiClientRef.current = null;
            }
            if (assemblyWsRef.current) {
                assemblyWsRef.current.close();
                assemblyWsRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, [activeView]);

    const handleVoiceInput = async (text: string, autoResume: boolean = false) => {
        const userEntry: TranscriptEntry = {
            id: Date.now().toString(),
            role: "user",
            content: text,
        };

        setTranscript(prev => [...prev, userEntry]);
        setCurrentUserSpeech("");
        setIsProcessing(true);
        setVoiceStatus("Oracle is thinking...");

        // Create initial assistant entry for streaming updates
        const assistantId = (Date.now() + 1).toString();
        let fullText = "";
        let lastChunkIndex = 0;

        try {
            // Use Gemini Live API for natural AI voice + streaming text
            const response = await fetch("/api/oracle/live", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error("Failed to get response");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response stream");

            // Set up audio playback
            const audioContext = new AudioContext({ sampleRate: 24000 });
            const audioChunks: ArrayBuffer[] = [];

            setIsSpeaking(true);
            setVoiceStatus("Oracle is speaking...");

            // Add initial empty assistant entry
            setTranscript(prev => [...prev, { id: assistantId, role: "assistant", content: "..." }]);

            // Read SSE stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === "audio" && data.data) {
                                // Decode base64 to ArrayBuffer
                                const binaryString = atob(data.data);
                                const bytes = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }
                                audioChunks.push(bytes.buffer);
                            } else if (data.type === "text" && data.data) {
                                fullText += data.data;

                                // Update transcript with accumulated text
                                const cleanedText = stripMarkdown(fullText);
                                setTranscript(prev =>
                                    prev.map(entry =>
                                        entry.id === assistantId
                                            ? { ...entry, content: cleanedText }
                                            : entry
                                    )
                                );

                                // Chunk on sentence boundaries for visual effect
                                const sentences = cleanedText.split(/(?<=[.!?])\s+/);
                                if (sentences.length > lastChunkIndex + 2 && sentences.length > 2) {
                                    const completedChunk = sentences.slice(lastChunkIndex, sentences.length - 1).join(" ");
                                    if (completedChunk.trim()) {
                                        setTranscript(prev =>
                                            prev.map(entry =>
                                                entry.id === assistantId
                                                    ? { ...entry, content: completedChunk }
                                                    : entry
                                            )
                                        );
                                        const newAssistantId = (Date.now() + 100 + sentences.length).toString();
                                        setTranscript(prev => [...prev, {
                                            id: newAssistantId,
                                            role: "assistant",
                                            content: sentences[sentences.length - 1]
                                        }]);
                                        lastChunkIndex = sentences.length - 1;
                                    }
                                }
                            } else if (data.type === "complete") {
                                console.log("[Oracle] Stream complete");
                            } else if (data.type === "error") {
                                throw new Error(data.message);
                            }
                        } catch (e) {
                            // Ignore JSON parse errors
                        }
                    }
                }
            }

            // Final update with complete text
            const finalText = stripMarkdown(fullText) || "I hear you. Let me think about that...";
            setTranscript(prev =>
                prev.map(entry =>
                    entry.id === assistantId
                        ? { ...entry, content: finalText }
                        : entry
                )
            );

            // Play all audio chunks
            if (audioChunks.length > 0) {
                const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of audioChunks) {
                    combined.set(new Uint8Array(chunk), offset);
                    offset += chunk.byteLength;
                }

                const int16Array = new Int16Array(combined.buffer);
                const float32Array = new Float32Array(int16Array.length);
                for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 32768;
                }

                const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
                audioBuffer.getChannelData(0).set(float32Array);

                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.onended = () => {
                    setIsSpeaking(false);
                    if (autoResume) {
                        setVoiceStatus("Listening...");
                        startListening();
                    } else {
                        setVoiceStatus("Tap to start speaking");
                    }
                };
                source.start();
            } else {
                setIsSpeaking(false);
                if (autoResume) {
                    setTimeout(() => startListening(), 500);
                } else {
                    setVoiceStatus("Tap to start speaking");
                }
            }

        } catch (error: any) {
            console.error("[Oracle] Voice input error:", error);
            setVoiceError(error.message || "Failed to get response");
            setVoiceStatus("Error - try again");
            setIsSpeaking(false);
            setTranscript(prev =>
                prev.map(entry =>
                    entry.id === assistantId
                        ? { ...entry, content: "Unable to generate AI content at this time. Please try again later." }
                        : entry
                )
            );
            if (autoResume) {
                setTimeout(() => startListening(), 1000);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Browser Text-to-Speech for Oracle responses
    const speakResponse = (text: string, autoResume: boolean = false) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();

            setIsSpeaking(true);
            setVoiceStatus("Oracle is speaking...");

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;

            // Try to find a good voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Samantha') ||
                v.name.includes('Alex') ||
                v.lang.startsWith('en')
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => {
                setIsSpeaking(false);
                if (autoResume) {
                    // Auto-resume listening after Oracle finishes speaking
                    setVoiceStatus("Listening...");
                    startListening();
                } else {
                    setVoiceStatus("Tap to start speaking");
                }
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                if (autoResume) {
                    startListening();
                } else {
                    setVoiceStatus("Tap to start speaking");
                }
            };

            speechSynthesis.speak(utterance);
        } else {
            if (autoResume) {
                startListening();
            } else {
                setVoiceStatus("Tap to start speaking");
            }
        }
    };

    // Start listening function for auto-resume
    const startListening = async () => {
        if (isListening || isSpeaking || isProcessing) return;

        setVoiceError(null);
        setVoiceStatus("Connecting...");

        try {
            // Get temporary token from our backend
            const tokenRes = await fetch("/api/speech/token");
            if (!tokenRes.ok) {
                throw new Error("Failed to get speech token");
            }
            const { token } = await tokenRes.json();
            console.log("[AssemblyAI] Got temporary token");

            // Build audio constraints with selected device
            const constraints: MediaStreamConstraints = {
                audio: selectedDeviceId
                    ? {
                        deviceId: { exact: selectedDeviceId },
                        sampleRate: 16000,
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true
                    }
                    : {
                        sampleRate: 16000,
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true
                    }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("[AssemblyAI] Got microphone stream");

            // Connect to AssemblyAI v3 Universal Streaming WebSocket
            const ws = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&encoding=pcm_s16le&token=${token}`);
            assemblyWsRef.current = ws;

            let currentTranscript = "";

            ws.onopen = () => {
                console.log("[AssemblyAI] WebSocket connected");
                setIsListening(true);
                setVoiceStatus("Listening...");

                // Use Web Audio API for PCM16 capture
                const audioContext = new AudioContext({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
                    const int16Array = new Int16Array(float32Array.length);
                    for (let i = 0; i < float32Array.length; i++) {
                        const s = Math.max(-1, Math.min(1, float32Array[i]));
                        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    return int16Array;
                };

                processor.onaudioprocess = (e) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmData = float32ToInt16(inputData);
                        ws.send(pcmData.buffer);
                    }
                };

                source.connect(processor);
                processor.connect(audioContext.destination);

                (ws as any)._audioContext = audioContext;
                (ws as any)._processor = processor;
                (ws as any)._stream = stream;
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("[AssemblyAI] Message:", data.type || data.message_type);

                // Handle v3 Turn events with auto-send on end_of_turn
                if (data.type === 'Turn' || data.message_type === 'Turn') {
                    const transcript = data.transcript || '';
                    if (transcript) {
                        setCurrentUserSpeech(transcript);
                        // AUTO-SEND: When user finishes speaking, send to Oracle
                        if (data.end_of_turn && transcript.trim()) {
                            console.log("[AssemblyAI] End of turn detected, sending to Oracle");
                            currentTranscript = transcript;
                            // Close connection and send to Oracle
                            ws.close();
                            setIsListening(false);
                            handleVoiceInput(transcript.trim(), true); // auto-resume after response
                        }
                    }
                } else if (data.type === 'Begin' || data.message_type === 'Begin') {
                    console.log("[AssemblyAI] Session started:", data.id);
                }
            };

            ws.onerror = (error) => {
                console.error("[AssemblyAI] WebSocket error:", error);
                setVoiceError("Speech recognition error. Try again.");
                setIsListening(false);
            };

            ws.onclose = () => {
                console.log("[AssemblyAI] WebSocket closed");
                // Cleanup audio resources
                const ctx = (ws as any)._audioContext;
                const strm = (ws as any)._stream;
                if (ctx) ctx.close();
                if (strm) strm.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            };

        } catch (err: any) {
            console.error("[Oracle] Microphone/AssemblyAI error:", err);
            setVoiceError(err.message || 'Unable to start voice recognition.');
            setIsListening(false);
            setVoiceStatus("Tap to start speaking");
        }
    };


    const toggleListening = useCallback(async () => {
        if (isListening) {
            // Stop listening
            setIsListening(false);
            setVoiceStatus("Tap to start speaking");

            if (assemblyWsRef.current) {
                // Cleanup happens in onclose handler
                assemblyWsRef.current.close();
                assemblyWsRef.current = null;
            }
        } else {
            // Start listening using our startListening function
            startListening();
        }
    }, [isListening, selectedDeviceId, isSpeaking, isProcessing]);

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleVoiceInput(textInput.trim());
            setTextInput("");
        }
    };

    // Save voice conversation to database
    const saveVoiceConversation = async () => {
        if (!user?.id || transcript.length === 0) return;

        try {
            await fetch("/api/oracle/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    type: "voice",
                    messages: transcript.map(t => ({
                        role: t.role,
                        content: t.content,
                        timestamp: new Date().toISOString()
                    }))
                })
            });
        } catch (error) {
            console.error("[VoiceMode] Failed to save conversation:", error);
        }
    };

    const exitVoiceMode = async () => {
        // Save conversation before exiting
        await saveVoiceConversation();

        // Stop AssemblyAI and MediaRecorder
        if (assemblyWsRef.current) {
            assemblyWsRef.current.close();
            assemblyWsRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (geminiClientRef.current) {
            geminiClientRef.current.stopRecording();
            geminiClientRef.current.disconnect();
        }
        setIsListening(false);
        setIsSpeaking(false);
        setTranscript([]);
        setCurrentUserSpeech("");
        setActiveView("landing");
    };

    // Fetch existing future visualization on vision view open
    const fetchExistingVision = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`/api/oracle/future/generate?userId=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.exists) {
                    setFutureData({
                        scenarios: data.scenarios,
                        wisdomContent: data.wisdomContent,
                        createdAt: data.createdAt
                    });
                }
            }
        } catch (error) {
            console.log("No existing vision found");
        }
    };

    // Generate AI-powered future vision with 3 scenarios
    const generateFutureVision = async () => {
        if (!user?.id) return;

        setIsLoadingVision(true);
        setVisionError(null);
        setScenarioImages([]);

        try {
            const response = await fetch("/api/oracle/future/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, yearsAhead: 20 })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to generate vision");
            }

            const data = await response.json();
            setFutureData({
                scenarios: data.scenarios,
                wisdomContent: data.wisdomContent,
                createdAt: data.createdAt
            });

            // Always generate 3 images (Age progression or Scene generation)
            if (data.scenarios) {
                setIsGeneratingImages(true);
                try {
                    const imageResponse = await fetch("/api/oracle/future/image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.id,
                            scenarios: data.scenarios,
                            originalPhotoBase64: uploadedPhoto || null
                        })
                    });

                    if (imageResponse.ok) {
                        const imageData = await imageResponse.json();
                        if (imageData.images && imageData.images.length > 0) {
                            setScenarioImages(imageData.images);
                        }
                    }
                } catch (imgError) {
                    console.error("[Vision] Image generation error:", imgError);
                } finally {
                    setIsGeneratingImages(false);
                }
            }
        } catch (error: any) {
            console.error("[Vision] Error:", error);
            setVisionError(error.message || "Failed to generate future vision");
        } finally {
            setIsLoadingVision(false);
        }
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
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 lg:px-12 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                        <span className="text-muted-foreground">›</span>
                        <span className="text-foreground font-medium">Oracle</span>
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
                                    <div className="flex-1 bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                        {futureData ? (
                                            // Vision has been generated - show 3 scenarios
                                            <div className="h-full overflow-y-auto">
                                                {/* Scenario Tabs */}
                                                <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-xs text-slate-500">
                                                            Last glimpsed: {new Date(futureData.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => generateFutureBlueprintPDF(futureData, user?.name?.split(" ")[0] || "Your")}
                                                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                                            >
                                                                <Download className="w-3 h-3" /> Download PDF
                                                            </button>
                                                            <button
                                                                onClick={() => { setFutureData(null); }}
                                                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                            >
                                                                <Sparkles className="w-3 h-3" /> Re-simulate
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {futureData.scenarios.map((scenario: any, idx: number) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedScenario(idx)}
                                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${selectedScenario === idx
                                                                    ? idx === 0 ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                        : idx === 1 ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                                    }`}
                                                            >
                                                                {idx === 0 ? "✨ Optimistic" : idx === 1 ? "📊 Current" : "⚠️ Warning"}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Three Age-Progressed Images Gallery */}
                                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                                        {[0, 1, 2].map((idx) => {
                                                            const imageUrl = scenarioImages[idx] || defaultScenarioImages[idx];
                                                            return (
                                                                <div key={idx} className="relative">
                                                                    <button
                                                                        onClick={() => setSelectedScenario(idx)}
                                                                        className={`relative aspect-square rounded-2xl overflow-hidden transition-all w-full ${selectedScenario === idx
                                                                            ? 'ring-2 ring-offset-2 ring-offset-background ' +
                                                                            (idx === 0 ? 'ring-green-500' : idx === 1 ? 'ring-blue-500' : 'ring-amber-500')
                                                                            : 'opacity-70 hover:opacity-100'
                                                                            }`}
                                                                    >
                                                                        {isGeneratingImages ? (
                                                                            <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                                                                                <div className="text-center">
                                                                                    <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-1" />
                                                                                    <p className="text-[10px] text-muted-foreground">
                                                                                        {idx === 0 ? 'Best' : idx === 1 ? 'Current' : 'Warning'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <img
                                                                                    src={imageUrl}
                                                                                    alt={`${idx === 0 ? 'Optimistic' : idx === 1 ? 'Current trajectory' : 'Warning'} future`}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                                <div className={`absolute bottom-0 left-0 right-0 p-2 text-center text-xs font-medium ${idx === 0 ? 'bg-green-500/80 text-white'
                                                                                    : idx === 1 ? 'bg-blue-500/80 text-white'
                                                                                        : 'bg-amber-500/80 text-white'
                                                                                    }`}>
                                                                                    {idx === 0 ? '✨ Best Future' : idx === 1 ? '📊 Current Path' : '⚠️ Warning'}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    {/* Expand button */}
                                                                    {!isGeneratingImages && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setLightboxImage(imageUrl);
                                                                            }}
                                                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                                                                            title="View larger"
                                                                        >
                                                                            <Maximize2 className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Selected Scenario Content */}
                                                <div className="p-6">
                                                    {futureData.scenarios[selectedScenario] && (
                                                        <div className="space-y-6">
                                                            {/* Scenario Header */}
                                                            <div className="flex flex-col md:flex-row gap-6">
                                                                {/* Age-Progressed Image */}
                                                                <div className="flex-shrink-0 relative group">
                                                                    {isGeneratingImages ? (
                                                                        <div className="w-48 h-48 rounded-2xl bg-muted animate-pulse flex items-center justify-center">
                                                                            <div className="text-center">
                                                                                <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-2" />
                                                                                <p className="text-xs text-muted-foreground">Generating your future...</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <img
                                                                                src={scenarioImages[selectedScenario] || defaultScenarioImages[selectedScenario]}
                                                                                alt={`Your ${selectedScenario === 0 ? 'optimistic' : selectedScenario === 1 ? 'current' : 'warning'} future`}
                                                                                className="w-48 h-48 rounded-2xl object-cover border-2 border-purple-500/30 shadow-lg shadow-purple-500/10 cursor-pointer"
                                                                                onClick={() => setLightboxImage(scenarioImages[selectedScenario] || defaultScenarioImages[selectedScenario])}
                                                                            />
                                                                            <button
                                                                                onClick={() => setLightboxImage(scenarioImages[selectedScenario] || defaultScenarioImages[selectedScenario])}
                                                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                                                                                title="View larger"
                                                                            >
                                                                                <Maximize2 className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Title and Description */}
                                                                <div className="flex-1">
                                                                    <h2 className="text-2xl font-bold mb-2 text-foreground">{futureData.scenarios[selectedScenario].title}</h2>
                                                                    <p className="text-muted-foreground">{futureData.scenarios[selectedScenario].description}</p>
                                                                </div>
                                                            </div>

                                                            {/* Narrative */}
                                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20">
                                                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                                                    {futureData.scenarios[selectedScenario].narrative}
                                                                </p>
                                                            </div>

                                                            {/* Life Path Breakdowns */}
                                                            <div>
                                                                <h3 className="text-lg font-semibold mb-4 text-foreground">Life Path Breakdown</h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {futureData.scenarios[selectedScenario].lifePaths?.map((path: any, pathIdx: number) => (
                                                                        <div key={pathIdx} className="p-4 rounded-xl bg-muted border border-border">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-lg text-foreground">{path.icon} {path.category}</span>
                                                                                <div className="flex items-center gap-1">
                                                                                    {[...Array(10)].map((_, i) => (
                                                                                        <div
                                                                                            key={i}
                                                                                            className={`w-1.5 h-4 rounded-full ${i < path.score
                                                                                                ? path.score >= 7 ? "bg-green-400" : path.score >= 5 ? "bg-blue-400" : "bg-amber-400"
                                                                                                : "bg-muted-foreground/20"
                                                                                                }`}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground mb-1">Now: {path.current}</p>
                                                                            <p className="text-sm text-foreground">{path.projection}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Wisdom Content */}
                                                            {futureData.wisdomContent && (
                                                                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                                                    <p className="text-sm text-amber-700 dark:text-amber-200/80 italic">
                                                                        💫 {futureData.wisdomContent}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            // Initial state - prompt to generate
                                            <div className="h-full flex items-center justify-center p-8">
                                                <div className="text-center max-w-lg">
                                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                                                        <Eye className="w-10 h-10 text-purple-400" />
                                                    </div>
                                                    <h2 className="text-3xl font-bold mb-4">Glimpse Your Future</h2>
                                                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                                                        Based on your memories, personality, and goals, I'll show you 3 possible futures 20 years from now.
                                                    </p>

                                                    {/* Optional Photo Upload */}
                                                    <div className="mb-6 p-4 rounded-xl bg-muted border border-dashed border-border">
                                                        <p className="text-xs text-muted-foreground mb-3">📷 Optional: Update your picture to see your possible future self.</p>

                                                        {uploadedPhoto ? (
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <img
                                                                        src={uploadedPhoto}
                                                                        alt="Uploaded photo"
                                                                        className="w-20 h-20 rounded-xl object-cover border-2 border-purple-500/50"
                                                                    />
                                                                    <button
                                                                        onClick={() => setUploadedPhoto(null)}
                                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-green-400">✓ Photo attached</p>
                                                                    <p className="text-xs text-slate-500">Update your picture to see your possible future self.</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-sm hover:bg-muted/80 transition-all">
                                                                <Upload className="w-4 h-4" />
                                                                Upload Photo
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onload = (event) => {
                                                                                setUploadedPhoto(event.target?.result as string);
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>

                                                    {visionError && (
                                                        <p className="text-red-400 text-sm mb-4">{visionError}</p>
                                                    )}
                                                    <button
                                                        onClick={generateFutureVision}
                                                        disabled={isLoadingVision}
                                                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                                                    >
                                                        {isLoadingVision ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Peering into the future...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles className="w-5 h-5" />
                                                                {uploadedPhoto ? "Continue with existing Photo" : "See My Future"}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                            How's it going?
                                        </h1>

                                        {/* Main Cards Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10 h-auto md:h-[520px]">
                                            {/* Left: Orb Card */}
                                            <button
                                                onClick={() => setActiveView("voice")}
                                                className="md:col-span-3 relative rounded-3xl bg-card border border-border overflow-hidden text-left hover:border-primary/30 transition-all group min-h-[320px] md:h-full shadow-sm"
                                            >
                                                {/* Orb */}
                                                <div className="absolute top-1/2 right-4 sm:right-12 -translate-y-1/2 scale-110">
                                                    <ThreeOrb state="idle" size={500} />
                                                </div>

                                                {/* Text */}
                                                <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 max-w-[200px] md:max-w-[260px] z-10">
                                                    <h3 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
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
                                                    className="flex-1 relative rounded-3xl bg-card border border-border p-8 text-left hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[220px] md:min-h-0 shadow-sm"
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
                                                    className="flex-1 relative rounded-3xl bg-card border border-border p-8 text-left hover:border-primary/30 transition-all group flex flex-col justify-between shadow-sm"
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
                                                            <Link
                                                                key={conv.id}
                                                                href={`/oracle/session/${conv.id}`}
                                                                className="flex flex-col justify-between p-5 rounded-2xl bg-card border border-border hover:bg-muted transition-all text-left group h-36 shadow-sm"
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
                                                                        <Icon className={`w-5 h-5 ${colorClass}`} />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                                                        {formatTimeAgo(conv.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">{conv.summary}</p>
                                                                </div>
                                                            </Link>
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
                                                className="absolute inset-0 z-40 bg-black/10 backdrop-blur-md"
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
                                                    {/* Layout Grid: Orb (Left) and Chat (Right) */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] w-full h-full max-w-7xl mx-auto px-8 md:px-12 pointer-events-none">
                                                        {/* Left Section: Orb & Mic Controls */}
                                                        <div className="flex flex-col items-center justify-center pointer-events-auto relative">
                                                            {/* Expanded Orb */}
                                                            <motion.div
                                                                initial={{ scale: 0.5, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.5, opacity: 0 }}
                                                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                                                className="flex items-center justify-center"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div style={{ transform: 'translateX(102px)', width: 550 }}> {/* Scaled alignment for 550px size */}
                                                                    <ThreeOrb state={orbState} size={550} />
                                                                </div>
                                                            </motion.div>

                                                            {/* Controls below Orb with Status */}
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.3 }}
                                                                className="mt-12 flex flex-col items-center justify-center gap-6"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Main Mic/End Toggle Button - Centered in flow */}
                                                                <button
                                                                    onClick={isListening ? exitVoiceMode : toggleListening}
                                                                    disabled={isProcessing}
                                                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl z-10 ${isListening
                                                                        ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/30"
                                                                        : "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 shadow-cyan-500/10 animate-pulse"
                                                                        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                >
                                                                    {isListening ? (
                                                                        <Phone className="w-7 h-7 rotate-[135deg]" />
                                                                    ) : (
                                                                        <Mic className="w-7 h-7" />
                                                                    )}
                                                                </button>

                                                                {/* Status - Moved below mic */}
                                                                <p className="text-slate-400 text-sm font-medium">
                                                                    {voiceStatus}
                                                                </p>

                                                                {/* Microphone Selector */}
                                                                {audioDevices.length > 1 && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Settings className="w-4 h-4 text-slate-500" />
                                                                        <select
                                                                            value={selectedDeviceId || ''}
                                                                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                                                                            className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 max-w-[200px]"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            {audioDevices.map((device) => (
                                                                                <option key={device.deviceId} value={device.deviceId}>
                                                                                    {device.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        </div>

                                                        {/* Right Section: Transcript & Input */}
                                                        <div className="hidden md:flex flex-col justify-end py-12 pointer-events-auto border-l border-white/5 pl-12 h-full max-h-[calc(100vh-100px)] overflow-hidden">
                                                            {/* Error Display (at top of chat) */}
                                                            {voiceError && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {voiceError}
                                                                </motion.div>
                                                            )}

                                                            {/* Transcript Display - Scrollable */}
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.2 }}
                                                                className="flex-1 overflow-y-auto pr-4 mb-8 custom-scrollbar scroll-smooth"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {transcript.length > 0 || currentUserSpeech ? (
                                                                    <div className="space-y-4">
                                                                        {transcript.map((entry, idx) => (
                                                                            <div
                                                                                key={entry.id}
                                                                                className={`flex flex-col ${entry.role === "user" ? "items-end" : "items-start"}`}
                                                                            >
                                                                                <span className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${entry.role === "user" ? "text-cyan-500" : "text-slate-500"}`}>
                                                                                    {entry.role === "user" ? "You" : "Oracle"}
                                                                                </span>
                                                                                <div
                                                                                    className={`max-w-[90%] text-sm px-4 py-2 rounded-2xl ${entry.role === "user"
                                                                                        ? "bg-cyan-500/10 text-cyan-50 border border-cyan-500/20"
                                                                                        : "bg-slate-800/40 text-slate-200 border border-slate-700/30"
                                                                                        }`}
                                                                                >
                                                                                    {entry.role === "assistant" && idx === transcript.length - 1 ? (
                                                                                        <TypewriterText text={entry.content} />
                                                                                    ) : (
                                                                                        entry.content
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {currentUserSpeech && (
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[10px] uppercase tracking-wider font-bold mb-1 text-cyan-500">You</span>
                                                                                <div className="max-w-[90%] text-sm px-4 py-2 rounded-2xl bg-cyan-500/10 text-cyan-50 border border-cyan-500/20">
                                                                                    {currentUserSpeech}
                                                                                    <span className="animate-pulse text-cyan-400">|</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div ref={transcriptEndRef} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-full flex items-center justify-center opacity-30">
                                                                        {/* Animated Dots Empty State */}
                                                                        <div className="flex space-x-1">
                                                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </motion.div>

                                                            {/* Visible Input */}
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <form
                                                                    onSubmit={handleTextSubmit}
                                                                    className="relative group"
                                                                >
                                                                    <div className="flex items-center gap-3 border border-white/10 bg-white/5 rounded-xl px-4 py-1 focus-within:border-cyan-500/30 focus-within:bg-white/10 transition-all duration-300">
                                                                        <input
                                                                            type="text"
                                                                            value={textInput}
                                                                            onChange={(e) => setTextInput(e.target.value)}
                                                                            placeholder="Type to chat..."
                                                                            className="flex-1 bg-transparent border-none py-3 text-white placeholder:text-slate-500 focus:outline-none text-sm"
                                                                            autoFocus
                                                                        />
                                                                        <button
                                                                            type="submit"
                                                                            disabled={!textInput.trim() || isProcessing}
                                                                            className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-20 transition-colors"
                                                                        >
                                                                            <SendHorizonal className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </motion.div>
                                                        </div>
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
                                                    <OracleChat
                                                        onClose={() => setActiveView("landing")}
                                                        onMicClick={() => setActiveView("voice")}
                                                    />
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

            {/* Lightbox Modal for enlarged image view */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.2 }}
                            className="relative max-w-4xl max-h-[90vh] w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxImage}
                                alt="Enlarged future scenario"
                                className="w-full h-full object-contain rounded-2xl"
                            />
                            <button
                                onClick={() => setLightboxImage(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
