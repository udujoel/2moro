"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Image as ImageIcon, Video, Type, Plus, X, Send, Check, Pause } from "lucide-react";

interface OmniJournalProps {
    onNewEntry: (entry: any) => void;
    people?: { id: string; name: string; avatar?: string }[];
    locationEnabled?: boolean;
}

export function OmniJournal({ onNewEntry, people = [], locationEnabled = false }: OmniJournalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"menu" | "text" | "voice" | "camera">("menu");
    const [textInput, setTextInput] = useState("");
    const [media, setMedia] = useState<File[]>([]);
    const [mediaPreview, setMediaPreview] = useState<string[]>([]);
    const [location, setLocation] = useState<{ name?: string, lat?: number, lng?: number } | undefined>(undefined);

    // Tagging State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [taggedPeople, setTaggedPeople] = useState<string[]>([]);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // AI Suggestions State
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

    // Fetch AI suggestions when modal opens with empty text
    useEffect(() => {
        if (isOpen && mode === "text" && textInput === "" && aiSuggestions.length === 0) {
            fetchSuggestions();
        }
    }, [isOpen, mode, textInput]);

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const res = await fetch("/api/suggestions/daily");
            if (res.ok) {
                const data = await res.json();
                setAiSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const regenerateSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const res = await fetch("/api/suggestions/regenerate", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setAiSuggestions(data.suggestions || []);
            } else if (res.status === 429) {
                const data = await res.json();
                alert(data.error || "Please wait before generating new suggestions");
            }
        } catch (error) {
            console.error("Failed to regenerate suggestions:", error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Only process if chunks exist (might be cleared by cancel)
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });
                    setMedia(prev => [...prev, audioFile]);
                    setMediaPreview(prev => [...prev, "https://cdn-icons-png.flaticon.com/512/25/25655.png"]); // Mock audio icon preview
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.warn("Microphone access failed, falling back to Mock Recording for demo.", err);

            // Mock Recording Logic
            setIsRecording(true);
            setRecordingTime(0);

            // Mock chunks
            audioChunksRef.current = []; // Empty or mock blob

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Override stopRecording logic for mock via ref check
            mediaRecorderRef.current = null;
        }
    };

    const confirmRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);

            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            } else {
                // Mock Confirm
                const mockAudioBlob = new Blob(["mock-audio-data"], { type: 'audio/webm' });
                const audioFile = new File([mockAudioBlob], "mock_voice_note.webm", { type: 'audio/webm' });
                setMedia(prev => [...prev, audioFile]);
                setMediaPreview(prev => [...prev, "https://cdn-icons-png.flaticon.com/512/25/25655.png"]);
            }
        }
    };

    const cancelRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);

            // Clear chunks to prevent save
            audioChunksRef.current = [];

            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop(); // onstop will check chunks length
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        }
    };


    // ... existing handlers ...
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newPos = e.target.selectionStart;
        setTextInput(newValue);
        setCursorPosition(e.target.selectionStart);

        // Check for @ trigger
        const lastAtPos = newValue.lastIndexOf("@", newPos - 1);
        if (lastAtPos !== -1) {
            const textAfterAt = newValue.substring(lastAtPos + 1, newPos);
            // Simple check: no spaces allowed in query for now to differentiate valid tag attempt
            if (!textAfterAt.includes(" ")) {
                setSuggestionQuery(textAfterAt);
                setShowSuggestions(true);
                return;
            }
        }
        setShowSuggestions(false);
    };

    const handleSelectPerson = (person: { id: string; name: string }) => {
        if (!textareaRef.current) return;

        const value = textInput;
        const lastAtPos = value.lastIndexOf("@", cursorPosition - 1);

        const newValue = `${value.substring(0, lastAtPos)} @${person.name} ${value.substring(cursorPosition)} `;

        setTextInput(newValue);
        setShowSuggestions(false);
        setTaggedPeople([...taggedPeople, person.id]);

        // Reset focus and cursor? 
        // For simplicity, just focus back
        textareaRef.current.focus();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setMedia([...media, file]);
            setMediaPreview([...mediaPreview, URL.createObjectURL(file)]);
        }
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim() && media.length === 0) return;

        console.log("Submitting memory...", { textInput, mediaCount: media.length });

        // Fetch location if enabled
        let currentLocation = location;
        if (locationEnabled && !currentLocation) {
            try {
                const pos: GeolocationPosition = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => reject(new Error("Location timeout")), 5000);
                    navigator.geolocation.getCurrentPosition(
                        (p) => { clearTimeout(timeoutId); resolve(p); },
                        (e) => { clearTimeout(timeoutId); reject(e); }
                    );
                });
                currentLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
            } catch (e) {
                console.warn("Location fetch failed or timed out", e);
            }
        }

        // Mock upload
        const mockMedia = media.map((file, i) => {
            let type: "image" | "video" | "audio" = "image";
            if (file.type.startsWith("video")) type = "video";
            if (file.type.startsWith("audio")) type = "audio";

            return {
                url: type === 'audio' ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" : "https://images.unsplash.com/photo-1501854140884-074bf6bfaedf?auto=format&fit=crop&w=800&q=80",
                type: type
            };
        });

        onNewEntry({
            content: textInput,
            type: media.length > 0 ? (media[0].type.startsWith("audio") ? "voice" : "image") : "text",
            media: mockMedia,
            personIds: taggedPeople,
            location: currentLocation
        });

        setTextInput("");
        setMedia([]);
        setMediaPreview([]);
        setTaggedPeople([]);
        setMode("menu");
        setIsOpen(false);
    };

    const toggleOpen = () => {
        if (isOpen) {
            setIsOpen(false);
            setMode("menu");
        } else {
            setIsOpen(true);
            setMode("text"); // Direct transition to text mode
        }
    };

    const filteredPeople = people.filter(p =>
        p.name.toLowerCase().includes(suggestionQuery.toLowerCase())
    );

    return (
        <>
            {/* Backdrop for focused mode */}
            <AnimatePresence>
                {isOpen && (mode === "text" || mode === "voice") && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        onClick={() => { setIsOpen(false); setMode("menu"); cancelRecording(); }}
                    />
                )}
            </AnimatePresence>

            {/* Modal Entry */}
            <AnimatePresence>
                {isOpen && (mode === "text" || mode === "voice") && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <motion.div
                            layoutId="add-button-morph"
                            initial={{ opacity: 0, scale: 0.1, x: "40vw", y: "40vh" }}
                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.1, x: "40vw", y: "40vh" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-card/95 backdrop-blur-lg p-6 rounded-3xl shadow-2xl w-[90vw] md:w-[600px] pointer-events-auto relative overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">New Journal Entry</span>
                                </div>
                                <button onClick={() => { setIsOpen(false); setMode("menu"); cancelRecording(); }} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Text Area */}
                            <div className="relative flex-1">
                                <textarea
                                    ref={textareaRef}
                                    value={textInput}
                                    onChange={handleTextChange}
                                    placeholder="What's on your mind? Type @ to tag people..."
                                    className="w-full min-h-[120px] bg-transparent resize-none outline-none text-lg p-4 placeholder:text-muted-foreground/50 scrollbar-none rounded-2xl focus:bg-muted/20 transition-colors"
                                    autoFocus
                                />

                                {/* Suggestions Dropdown for @mentions */}
                                {showSuggestions && filteredPeople.length > 0 && (
                                    <div className="absolute top-12 left-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto w-64 animate-in fade-in zoom-in-95 duration-100">
                                        {filteredPeople.map(person => (
                                            <button
                                                key={person.id}
                                                onClick={() => handleSelectPerson(person)}
                                                className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 transition-colors"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {person.avatar ? <img src={person.avatar} className="w-full h-full rounded-full" /> : person.name[0]}
                                                </div>
                                                <span className="text-sm">{person.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* AI Suggestions - Horizontal Bubbles Below Input */}
                            <AnimatePresence>
                                {textInput === "" && (aiSuggestions.length > 0 || loadingSuggestions) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-wrap justify-center items-center gap-2 py-3">
                                            {loadingSuggestions ? (
                                                <div className="flex items-center gap-2 text-muted-foreground px-3 py-1.5">
                                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-xs">Finding suggestions...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {aiSuggestions.map((suggestion, i) => (
                                                        <motion.button
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            onClick={() => setTextInput(suggestion)}
                                                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 hover:bg-muted border border-purple-500/30 hover:border-purple-500/60 text-foreground/80 hover:text-foreground transition-all cursor-pointer whitespace-nowrap"
                                                        >
                                                            {suggestion}
                                                        </motion.button>
                                                    ))}
                                                    <button
                                                        onClick={regenerateSuggestions}
                                                        disabled={loadingSuggestions}
                                                        className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                                    >
                                                        <span>↻</span> More
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Media Previews */}
                            {mediaPreview.length > 0 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto p-1">
                                    {mediaPreview.map((src, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                                            <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Bottom Toolbar or Recording Pill */}
                            <div className="pt-4 h-16 relative flex items-center justify-between">
                                <AnimatePresence mode="wait">
                                    {isRecording ? (
                                        <motion.div
                                            key="recording-pill"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                            layoutId="recording-pill"
                                            className="absolute inset-0 z-10 flex items-center justify-center"
                                        >
                                            <div className="bg-white dark:bg-zinc-800 border border-border shadow-lg rounded-full px-1 py-1 flex items-center gap-4 w-full h-[60px] max-w-[400px]">
                                                {/* Cancel Button */}
                                                <button
                                                    onClick={cancelRecording}
                                                    className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:opacity-80 transition-opacity"
                                                >
                                                    Cancel
                                                </button>

                                                {/* Timer & Label Container */}
                                                <div className="flex-1 flex flex-col items-center justify-center leading-none -mt-1">
                                                    <span className="text-[10px] text-muted-foreground mb-1">Go ahead, record a quick note</span>
                                                    <div className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ opacity: [1, 0.5, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                                            className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                                        />
                                                        <span className="font-mono font-bold text-lg tabular-nums text-foreground">
                                                            {formatTime(recordingTime)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center gap-2 pr-1">
                                                    <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                                                        <Pause className="w-4 h-4 fill-current" />
                                                    </button>
                                                    <button
                                                        onClick={confirmRecording}
                                                        className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="toolbar"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex justify-between items-center w-full"
                                        >
                                            <div className="flex gap-2">
                                                <label className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                                                    <ImageIcon className="w-5 h-5" />
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                </label>
                                                <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                                    <Video className="w-5 h-5" />
                                                </button>
                                                <motion.button
                                                    onClick={startRecording}
                                                    layoutId="recording-pill-target"
                                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                                >
                                                    <Mic className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                            <button
                                                onClick={handleTextSubmit}
                                                disabled={!textInput.trim() && media.length === 0}
                                                className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 disabled:opacity-50 font-medium flex items-center gap-2"
                                            >
                                                <Send className="w-4 h-4" />
                                                Save
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                {mode !== 'text' && mode !== 'voice' && (
                    <>
                        {/* Playful floating label */}
                        {/* Playful floating label - Curved Text */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -top-10 -left-10 w-36 h-36 pointer-events-none z-40"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-25deg]">
                                <defs>
                                    <path id="curve" d="M 12,50 A 38,38 0 0,1 88,50" fill="transparent" />
                                </defs>
                                <text className="text-[9px] font-bold font-serif italic fill-white drop-shadow-md">
                                    <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                        click here to add a memory
                                    </textPath>
                                </text>
                            </svg>
                        </motion.div>
                        <motion.button
                            layoutId="add-button-morph"
                            onClick={toggleOpen}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                boxShadow: [
                                    "0 0 0 0 rgba(59, 130, 246, 0.7)",
                                    "0 0 0 15px rgba(59, 130, 246, 0)",
                                    "0 0 0 0 rgba(59, 130, 246, 0)"
                                ],
                                background: [
                                    "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)",
                                    "linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(29, 78, 216) 100%)",
                                    "linear-gradient(135deg, rgb(29, 78, 216) 0%, rgb(59, 130, 246) 100%)",
                                    "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)"
                                ]
                            }}
                            transition={{
                                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                background: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white overflow-hidden"
                            style={{ background: "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)" }}
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 360, 360, 0, 0]
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    times: [0, 0.23, 0.27, 0.48, 0.52]
                                }}
                            >
                                <Plus className="w-6 h-6" />
                            </motion.div>
                        </motion.button>
                    </>
                )}
            </div>
        </>
    );
}
