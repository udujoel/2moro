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
            className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto w-full"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6"
            >
                <CheckCircle2 className="w-8 h-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-2">Blueprint Synthesized</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                Your neural profile has been calibrated. Review your identity before initializing the system.
            </p>

            <div className="bg-card border border-border rounded-3xl w-full overflow-hidden shadow-2xl mb-8">
                {/* Identity Header */}
                <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-background shadow-sm overflow-hidden bg-muted">
                        {profile.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.image} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-10 h-10 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{profile.personalityType || "The Explorer"}</h3>
                        <p className="text-muted-foreground">{profile.zodiac} • Born {profile.dob}</p>
                        <div className="mt-2 text-sm text-foreground/80 italic">
                            "{profile.personalityDescription}"
                        </div>
                    </div>
                </div>

                {/* Traits Split */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Me Now */}
                    <div className="p-6 border-r border-border bg-red-500/5">
                        <div className="flex items-center gap-2 mb-4 text-red-500 font-bold uppercase text-xs tracking-wider">
                            <User className="w-4 h-4" /> Me Now
                        </div>
                        <ul className="space-y-2">
                            {profile.meNow?.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Me 2moro */}
                    <div className="p-6 bg-green-500/5">
                        <div className="flex items-center gap-2 mb-4 text-green-500 font-bold uppercase text-xs tracking-wider">
                            <Sparkles className="w-4 h-4" /> Me 2moro
                        </div>
                        <ul className="space-y-2">
                            {profile.me2moro?.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <Link
                href="/dashboard"
                onClick={() => {
                    localStorage.setItem("onboardingCompleted", "true");
                    // Theme handled by user-provider or global pref
                }}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                Save & Enter Compass <Wallet className="w-5 h-5" />
            </Link>
        </motion.div>
    );
}
