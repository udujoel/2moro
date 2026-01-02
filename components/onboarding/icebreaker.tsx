"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, RefreshCw, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgePicker } from "./age-picker";

interface IcebreakerProps {
    onComplete: (data: any) => void;
}

export function Icebreaker({ onComplete }: IcebreakerProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [confirmedAge, setConfirmedAge] = useState(28);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
            simulateAnalysis();
        }
    };

    const simulateAnalysis = () => {
        setAnalyzing(true);
        // Mock API call
        setTimeout(() => {
            const mockAge = 28;
            setAnalysis({
                caption: "You look like someone who enjoys quiet contemplation but loves a chaotic coffee shop.",
                age: mockAge,
                vibe: "Thoughtful Explorer"
            });
            setConfirmedAge(mockAge);
            setAnalyzing(false);
        }, 2500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-lg mx-auto"
        >
            {!analysis && !analyzing && (
                <div className="w-full space-y-8 text-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">The Icebreaker</h2>
                        <p className="text-muted-foreground">Upload a photo that represents you.</p>
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-3xl cursor-pointer hover:bg-card/30 transition-colors group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                <Camera className="w-8 h-8" />
                            </div>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Click to upload photo</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                </div>
            )}

            {(analyzing || (image && !analysis)) && (
                <div className="flex flex-col items-center justify-center w-full h-64">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 mb-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image!} alt="Analyzing" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-white" />
                        </div>
                    </div>
                    <p className="text-lg font-medium animate-pulse text-primary">Analyzing Vibe...</p>
                </div>
            )}

            {analysis && !analyzing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex flex-col items-center"
                >
                    {/* Circular Image Cutout */}
                    <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-background ring-4 ring-primary/20 mb-8 z-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image!} alt="User" className="w-full h-full object-cover" />
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-8 pt-16 -mt-16 w-full shadow-lg flex flex-col items-center">
                        <p className="text-lg italic font-medium text-center mb-8 text-muted-foreground">
                            "{analysis.caption}"
                        </p>

                        <div className="flex flex-col items-center gap-2 mb-8">
                            <div className="flex items-center gap-3 text-2xl font-light">
                                <span>I am</span>
                                <AgePicker value={confirmedAge} onChange={setConfirmedAge} />
                                <span>years old.</span>
                            </div>
                        </div>

                        <div className="bg-muted/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
                            Vibe Check: {analysis.vibe}
                        </div>

                        <button
                            onClick={() => onComplete({ ...analysis, age: confirmedAge })}
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Confirm Identity <Check className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
