"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

interface BaselineSelectorProps {
    onComplete: (data: any) => void;
}

const ADJECTIVES = [
    "Ambitions", "Calm", "Chaotic", "Disciplined", "Drifting",
    "Energetic", "Focused", "Anxious", "Creative", "Resilient",
    "Successful", "Peaceful", "Wealthy", "Content", "Bold"
];

export function BaselineSelector({ onComplete }: BaselineSelectorProps) {
    const [step, setStep] = useState<"current" | "future">("current");
    const [currentTraits, setCurrentTraits] = useState<string[]>([]);
    const [futureTraits, setFutureTraits] = useState<string[]>([]);

    const toggleTrait = (trait: string) => {
        if (step === "current") {
            if (currentTraits.includes(trait)) {
                setCurrentTraits(currentTraits.filter(t => t !== trait));
            } else if (currentTraits.length < 3) {
                setCurrentTraits([...currentTraits, trait]);
            }
        } else {
            if (futureTraits.includes(trait)) {
                setFutureTraits(futureTraits.filter(t => t !== trait));
            } else if (futureTraits.length < 3) {
                setFutureTraits([...futureTraits, trait]);
            }
        }
    };

    const handleNext = () => {
        if (step === "current") {
            setStep("future");
        } else {
            onComplete({
                baseline: {
                    current: currentTraits,
                    future: futureTraits
                }
            });
        }
    };

    const selected = step === "current" ? currentTraits : futureTraits;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-lg mx-auto"
        >
            <div className="w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">The Baseline</h2>
                    <p className="text-muted-foreground text-lg">
                        {step === "current" ? "Who are you right now?" : "Who do you want to become?"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Select 3 adjectives.</p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                    {ADJECTIVES.map((trait) => {
                        const isSelected = selected.includes(trait);
                        return (
                            <button
                                key={trait}
                                onClick={() => toggleTrait(trait)}
                                className={`px-4 py-2 rounded-full border transition-all ${isSelected
                                        ? "bg-primary text-primary-foreground border-primary scale-110 shadow-md"
                                        : "bg-background border-border hover:border-primary/50 text-muted-foreground"
                                    }`}
                            >
                                {trait}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-8">
                    <button
                        onClick={handleNext}
                        disabled={selected.length !== 3}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        {step === "current" ? "Next Step" : "Complete Profile"}
                        {step === "current" ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
