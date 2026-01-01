"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, RefreshCw, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface IcebreakerProps {
    onComplete: (data: any) => void;
}

export function Icebreaker({ onComplete }: IcebreakerProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);

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
            setAnalysis({
                caption: "You look like someone who enjoys quiet contemplation but loves a chaotic coffee shop. This was taken in your late 20s?",
                age: 28,
                occupation: "Designer",
                vibe: "Thoughtful Explorer"
            });
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
            <div className="w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">The Icebreaker</h2>
                    <p className="text-muted-foreground">Upload a photo that represents you.</p>
                </div>

                {!image ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                <Camera className="w-8 h-8" />
                            </div>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Click to upload photo</p>
                            <p className="text-xs text-gray-400">SVG, PNG, JPG (MAX. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                ) : (
                    <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt="User upload" className="w-full h-full object-cover" />
                        {analyzing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                <RefreshCw className="w-8 h-8 animate-spin mb-2 text-primary" />
                                <p className="font-medium animate-pulse">Analyzing Vibe...</p>
                            </div>
                        )}
                    </div>
                )}

                {analysis && !analyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border p-6 rounded-2xl shadow-lg space-y-4"
                    >
                        <div>
                            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">AI Insight</p>
                            <p className="text-lg italic font-medium leading-relaxed">"{analysis.caption}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted p-3 rounded-xl">
                                <p className="text-xs text-muted-foreground">Estimated Age</p>
                                <p className="font-bold text-lg">{analysis.age}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-xl">
                                <p className="text-xs text-muted-foreground">Vibe</p>
                                <p className="font-bold text-lg">{analysis.vibe}</p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button className="flex-1 py-3 rounded-xl border border-border font-medium text-sm hover:bg-muted transition-colors">
                                Retake
                            </button>
                            <button
                                onClick={() => onComplete(analysis)}
                                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                Confirm <Check className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
