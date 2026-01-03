"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaselineSelectorProps {
    onComplete: (data: any) => void;
    generatedTraits?: { negatives: string[], fixes: string[] };
}

export function BaselineSelector({ onComplete, generatedTraits }: BaselineSelectorProps) {
    const [selectedNegatives, setSelectedNegatives] = useState<string[]>([]);
    const [selectedFixes, setSelectedFixes] = useState<string[]>([]);

    // If API provided traits, use them. Otherwise fallback.
    const NEGATIVES = generatedTraits?.negatives?.length ? generatedTraits.negatives : [
        "Inconsistent Sleep", "Social Anxiety", "Procrastination",
        "Doomscrolling", "Poor Hydration", "Lack of Focus"
    ];

    const FIXES = generatedTraits?.fixes?.length ? generatedTraits.fixes : [
        "Consistent Bedtime", "Daily Networking", "Pomodoro Technique",
        "Screen Time Limit", "Water Tracking", "Deep Work Blocks"
    ];

    const toggleNegative = (trait: string) => {
        if (selectedNegatives.includes(trait)) {
            setSelectedNegatives(prev => prev.filter(t => t !== trait));
        } else {
            setSelectedNegatives(prev => [...prev, trait]);
        }
    };

    const handleContinue = () => {
        // Map negatives to fixes intelligently? 
        // For now, we accept current selection or auto-select fixes based on index if matching.
        // Actually, the prompt says: "negatives ... pre-populated in base-line, and the fix in the target".
        // So we should probably just confirm them.
        onComplete({
            baseline: selectedNegatives,
            target: generatedTraits?.fixes || selectedFixes // If AI generated, use all fixes as target? Or selection? Let's assume selection or all.
            // Requirement interpretation: "negatives ... pre-populated in base-line, and the fix in the target"
            // So baselines = negatives list, target = fixes list.
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-2xl mx-auto w-full"
        >
            <div className="w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">The Baseline & The Target</h2>
                    <p className="text-muted-foreground">Based on your chart, we've identified potential shadows and their remedies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Baseline / Negatives */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                            Current Baseline
                            <span className="text-xs font-normal bg-red-500/10 px-2 py-0.5 rounded-full">Shadows</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {NEGATIVES.map((trait, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => toggleNegative(trait)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-sm font-medium transition-all text-left border",
                                        "bg-background border-border text-foreground opacity-80" // Just display them as list items essentially
                                    )}
                                >
                                    {trait}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Target / Fixes */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
                            The Target
                            <span className="text-xs font-normal bg-green-500/10 px-2 py-0.5 rounded-full">Growth</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {FIXES.map((trait, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 + 0.2 }}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-sm font-medium transition-all text-left border",
                                        "bg-background border-green-500/30 text-foreground"
                                    )}
                                >
                                    {trait}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleContinue}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        Accept Calibration <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
