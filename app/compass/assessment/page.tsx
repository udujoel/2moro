"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/top-bar";
import { PersonalityAssessment } from "@/components/compass/personality-assessment";
import { savePersonalityTest } from "@/app/actions/compass";
import { useUser } from "@/components/user-provider";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AssessmentPage() {
    const { user } = useUser();
    const router = useRouter();
    const [isComplete, setIsComplete] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleComplete = async (assessmentResult: any) => {
        setResult(assessmentResult);
        setIsComplete(true);
    };

    const handleSave = async () => {
        if (!user || !result) return;

        setIsSaving(true);
        const response = await savePersonalityTest(
            user.id,
            result.mbtiType,
            result.description,
            result.traits,
            result.responses
        );

        if (response.success) {
            setTimeout(() => {
                // Add refresh=true to trigger new recommendations
                router.push("/compass?refresh=true");
            }, 1500);
        } else {
            setIsSaving(false);
            alert("Failed to save test results. Please try again.");
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            <Sidebar className="hidden md:flex shrink-0 z-30" />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-muted/10">
                <TopBar title="Personality Assessment" />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {/* Back Button */}
                    <Link
                        href="/compass"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Compass
                    </Link>

                    {!isComplete ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                    Discover Your Personality Type
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Answer honestly to get personalized insights and recommendations ✨
                                </p>
                            </div>

                            <PersonalityAssessment onComplete={handleComplete} />
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl">
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <Sparkles className="w-10 h-10 text-primary" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold mb-2">You are an</h2>
                                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                                        {result.mbtiType}
                                    </h1>
                                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                        {result.description}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="font-semibold text-lg mb-3">Your Traits:</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-secondary/30 rounded-xl p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Energy</p>
                                            <p className="font-semibold">{result.traits.energy}</p>
                                        </div>
                                        <div className="bg-secondary/30 rounded-xl p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Perception</p>
                                            <p className="font-semibold">{result.traits.perception}</p>
                                        </div>
                                        <div className="bg-secondary/30 rounded-xl p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Decisions</p>
                                            <p className="font-semibold">{result.traits.decisions}</p>
                                        </div>
                                        <div className="bg-secondary/30 rounded-xl p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Structure</p>
                                            <p className="font-semibold">{result.traits.structure}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </motion.div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Save & Get Recommendations
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
}
