"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icebreaker } from "@/components/onboarding/icebreaker";
import { PersonalityQuiz } from "@/components/onboarding/personality-quiz";
import { BaselineSelector } from "@/components/onboarding/baseline-selector";
import { OnboardingSummary } from "@/components/onboarding/summary";
import { Play } from "lucide-react";
import Link from "next/link";

export type OnboardingStep = "welcome" | "icebreaker" | "quiz" | "baseline" | "summary";

export default function OnboardingPage() {
    const [step, setStep] = useState<OnboardingStep>("welcome");
    const [userProfile, setUserProfile] = useState<any>({});

    const handleIcebreakerComplete = (data: any) => {
        setUserProfile((prev: any) => ({ ...prev, ...data }));
        setStep("quiz");
    };

    const handleQuizComplete = (data: any) => {
        setUserProfile((prev: any) => ({ ...prev, ...data }));
        setStep("baseline");
    };

    const handleBaselineComplete = (data: any) => {
        setUserProfile((prev: any) => ({ ...prev, ...data }));
        setStep("summary");
    };

    return (
        <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-500 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-50">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                        <Play className="w-3 h-3 fill-primary text-primary" />
                    </div>
                    2moro
                </Link>
            </div>

            <AnimatePresence mode="wait">
                {step === "welcome" && (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-screen p-6 text-center max-w-md mx-auto"
                    >
                        <h1 className="text-4xl font-bold mb-4">The Mirror</h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Let's start by understanding who you are today. We'll skip the boring forms.
                        </p>
                        <button
                            onClick={() => setStep("icebreaker")}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                        >
                            Begin Reflection
                        </button>
                    </motion.div>
                )}

                {step === "icebreaker" && (
                    <Icebreaker key="icebreaker" onComplete={handleIcebreakerComplete} />
                )}

                {step === "quiz" && (
                    <PersonalityQuiz key="quiz" onComplete={handleQuizComplete} />
                )}

                {step === "baseline" && (
                    <BaselineSelector key="baseline" onComplete={handleBaselineComplete} />
                )}

                {step === "summary" && (
                    <OnboardingSummary key="summary" profile={userProfile} />
                )}
            </AnimatePresence>
        </div>
    );
}
