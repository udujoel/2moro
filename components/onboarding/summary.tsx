"use client";

import { motion } from "framer-motion";
import { CheckCircle2, User, Wallet, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

interface OnboardingSummaryProps {
    profile: any;
}

export function OnboardingSummary({ profile }: OnboardingSummaryProps) {
    const { setTheme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-lg mx-auto text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6"
            >
                <CheckCircle2 className="w-10 h-10 text-primary" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-2">You are ready.</h2>
            <p className="text-muted-foreground mb-8 text-lg">Your reflection is complete, {profile.vibe}.</p>

            <div className="bg-card border border-border rounded-2xl w-full p-6 text-left space-y-4 shadow-lg mb-8">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Identity</p>
                        <p className="font-semibold">{profile.age} • {profile.occupation}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Archetype</p>
                        <p className="font-semibold">{profile.archetype} ({profile.mbti})</p>
                    </div>
                </div>
            </div>

            <Link
                href="/dashboard"
                onClick={() => {
                    setTheme("daybreak");
                    localStorage.setItem("onboardingCompleted", "true");
                }}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                Enter {profile.archetype === "The Architect" ? "The Studio" : "The Compass"}
            </Link>
        </motion.div>
    );
}
