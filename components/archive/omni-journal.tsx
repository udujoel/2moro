
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Image as ImageIcon, Video, Type, Plus, X, Send } from "lucide-react";

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

        // Fetch location if enabled
        let currentLocation = location;
        if (locationEnabled && !currentLocation) {
            try {
                const pos: GeolocationPosition = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                currentLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
            } catch (e) {
                console.warn("Location fetch failed", e);
            }
        }

        // Mock upload
        const mockMedia = media.map((file, i) => ({
            url: "https://images.unsplash.com/photo-1501854140884-074bf6bfaedf?auto=format&fit=crop&w=800&q=80",
            type: file.type.startsWith("image") ? "image" : "video" as "image" | "video"
        }));

        onNewEntry({
            content: textInput,
            type: media.length > 0 ? "image" : "text",
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
        }
    };

    const filteredPeople = people.filter(p =>
        p.name.toLowerCase().includes(suggestionQuery.toLowerCase())
    );

    return (
        <>
            {/* Backdrop for focused mode */}
            <AnimatePresence>
                {isOpen && mode === "text" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        onClick={() => { setIsOpen(false); setMode("menu"); }}
                    />
                )}
            </AnimatePresence>

            {/* Modal Entry - Centered completely independent of FAB */}
            <AnimatePresence>
                {isOpen && mode === "text" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border border-border p-6 rounded-3xl shadow-2xl w-[90vw] md:w-[600px] pointer-events-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">New Memory</span>
                                </div>
                                <button onClick={() => { setIsOpen(false); setMode("menu"); }} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative">
                                <textarea
                                    ref={textareaRef}
                                    value={textInput}
                                    onChange={handleTextChange}
                                    placeholder="What's on your mind? Type @ to tag people..."
                                    className="w-full h-48 bg-transparent resize-none outline-none text-xl p-2 placeholder:text-muted-foreground/50"
                                    autoFocus
                                />

                                {/* Suggestions Dropdown */}
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

                            {mediaPreview.length > 0 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto p-1">
                                    {mediaPreview.map((src, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0">
                                            <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-border">
                                <div className="flex gap-2">
                                    <label className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                                        <ImageIcon className="w-5 h-5" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                        <Mic className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleTextSubmit}
                                    disabled={!textInput.trim() && media.length === 0}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 disabled:opacity-50 font-medium flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Action Button Menu */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {isOpen && mode === "menu" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            className="mb-4 flex flex-col gap-3 items-end"
                        >
                            <button onClick={() => setMode("text")} className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-lg hover:bg-muted font-medium transition-colors">
                                <span>Add Memory</span>
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {mode !== 'text' && (
                    <motion.button
                        onClick={toggleOpen}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${isOpen ? "bg-muted text-foreground rotate-45" : "bg-primary text-primary-foreground"
                            }`}
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                )}
            </div>
        </>
    );
}
