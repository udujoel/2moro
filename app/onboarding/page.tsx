"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icebreaker } from "@/components/onboarding/icebreaker";
import { AgePicker } from "@/components/onboarding/age-picker";
import { TraitsEditor } from "@/components/onboarding/traits-editor";
import { PersonalityQuiz } from "@/components/onboarding/personality-quiz";
import { OnboardingSummary } from "@/components/onboarding/summary";
import { Play, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";

export type OnboardingStep = "welcome" | "icebreaker" | "dob" | "quiz" | "traits" | "summary";

const STEPS = [
    { id: "welcome", label: "Welcome", description: "Start your journey" },
    { id: "icebreaker", label: "Analysis", description: "AI Visual Scan" },
    { id: "dob", label: "Origins", description: "Cosmic calibration" },
    { id: "quiz", label: "Mind", description: "Personality Mapping" },
    { id: "traits", label: "Blueprint", description: "Me Now vs Me 2moro" },
    { id: "summary", label: "Your Profile", description: "Ready to launch" },
];

export default function OnboardingPage() {
    const [step, setStep] = useState<OnboardingStep>("welcome");
    const [userProfile, setUserProfile] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { updateProfileImage, onboardingCompleted, completeOnboarding } = useUser();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (onboardingCompleted) {
            router.push("/dashboard");
        }
    }, [onboardingCompleted, router]);

    const handleIcebreakerComplete = (data: any) => {
        setUserProfile((prev: any) => ({ ...prev, ...data }));
        if (data.image) {
            updateProfileImage(data.image);
        }
        setStep("dob");
    };

    const handleDobComplete = (data: any) => {
        // data contains { dob, zodiac }
        setUserProfile((prev: any) => ({ ...prev, ...data }));
        setStep("quiz");
    };

    const handleQuizComplete = async (data: any) => {
        // data contains { quizResult }
        setIsLoading(true);
        const results = { ...userProfile, ...data };
        setUserProfile(results); // Optimistic update

        try {
            // Call AI to generate Traits based on Zodiac + Quiz
            const { analyzePersonalityAndTraits } = await import("@/app/actions/onboarding");
            const aiData = await analyzePersonalityAndTraits(results.zodiac, data.quizResult);

            if (aiData.success) {
                setUserProfile((prev: any) => ({
                    ...prev,
                    personalityType: aiData.personalityType,
                    personalityDescription: aiData.personalityDescription,
                    meNow: aiData.meNow,
                    me2moro: aiData.me2moro
                }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setStep("traits");
        }
    };

    const handleTraitsComplete = (data: any) => {
        setUserProfile((prev: any) => ({ ...prev, ...data }));
        setStep("summary");
    };

    // Final step triggers complete
    const handleSummaryComplete = () => {
        completeOnboarding();
    };


    if (!mounted) return null;

    const currentStepIndex = STEPS.findIndex(s => s.id === step);

    return (
        <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-500 overflow-hidden flex flex-col md:flex-row">

            {/* Left Panel: Stepper */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-card border-b md:border-b-0 md:border-r border-border p-6 flex flex-col justify-between z-10">
                <div>
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-8 md:mb-12">
                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="w-3 h-3 fill-primary text-primary" />
                        </div>
                        2moro
                    </Link>

                    <div className="space-y-6">
                        {STEPS.map((s, index) => {
                            const isActive = s.id === step;
                            const isCompleted = index < currentStepIndex;

                            return (
                                <div key={s.id} className={`flex items-start gap-4 transition-opacity duration-300 ${isActive || isCompleted ? "opacity-100" : "opacity-40"}`}>
                                    <div className="mt-1">
                                        {isCompleted ? (
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        ) : isActive ? (
                                            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"}`}>{s.label}</p>
                                        <p className="text-xs text-muted-foreground">{s.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-xs text-muted-foreground mt-8 md:mt-0 opacity-50">
                    Step {currentStepIndex + 1} of {STEPS.length}
                </div>
            </div>

            {/* Right Panel: Content */}
            <div className="flex-1 relative overflow-y-auto overflow-x-hidden md:bg-muted/10">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center space-y-4"
                        >
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-lg font-medium animate-pulse">Synthesizing Personality Profile...</p>
                        </motion.div>
                    ) : (
                        <>
                            {step === "welcome" && (
                                <motion.div
                                    key="welcome"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col items-center justify-center min-h-[50vh] md:h-full p-8 text-center max-w-lg mx-auto"
                                >
                                    <h1 className="text-4xl font-bold mb-4">Welcome to 2moro</h1>
                                    <p className="text-lg text-muted-foreground mb-8">
                                        A living operating system for your life. Let's calibrate your profile with Neural Analysis.
                                    </p>
                                    <button
                                        onClick={() => setStep("icebreaker")}
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg hover:shadow-primary/20"
                                    >
                                        Start Setup
                                    </button>
                                </motion.div>
                            )}

                            {step === "icebreaker" && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <Icebreaker key="icebreaker" onComplete={handleIcebreakerComplete} />
                                </div>
                            )}

                            {step === "dob" && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <AgePicker key="dob" onComplete={handleDobComplete} currentAge={userProfile.predictedAge} />
                                </div>
                            )}

                            {step === "quiz" && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <PersonalityQuiz key="quiz" onComplete={handleQuizComplete} />
                                </div>
                            )}

                            {step === "traits" && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <TraitsEditor
                                        key="traits"
                                        onComplete={handleTraitsComplete}
                                        initialData={{
                                            personalityType: userProfile.personalityType || "Explorer",
                                            personalityDescription: userProfile.personalityDescription || "Unknown",
                                            meNow: userProfile.meNow || [],
                                            me2moro: userProfile.me2moro || []
                                        }}
                                    />
                                </div>
                            )}

                            {step === "summary" && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <OnboardingSummary key="summary" profile={userProfile} />
                                </div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
