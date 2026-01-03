"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { analyzeHoroscopeAndTraits } from "@/app/actions/onboarding";
import { Loader2 } from "lucide-react";

interface AgePickerProps {
    onComplete: (data: any) => void;
    currentAge?: number;
}

export function AgePicker({ onComplete, currentAge = 25 }: AgePickerProps) {
    // Calculate default DOB based on predicted age
    // e.g. Age 25 in 2026 -> Born in 2001
    const defaultYear = new Date().getFullYear() - currentAge;
    const defaultDob = `${defaultYear}-01-01`;

    const [dob, setDob] = useState(defaultDob);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!dob) return;
        setIsLoading(true);

        try {
            const result = await analyzeHoroscopeAndTraits(dob);
            if (result.success) {
                onComplete({
                    dob,
                    zodiac: result.zodiac,
                    negatives: result.negatives,
                    fixes: result.fixes
                });
            } else {
                console.error("Horoscope failed");
                onComplete({ dob, zodiac: "Unknown", negatives: [], fixes: [] });
            }
        } catch (e) {
            console.error(e);
            onComplete({ dob });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-8 max-w-md w-full text-center"
        >
            <h2 className="text-3xl font-bold mb-4">When did your journey begin?</h2>
            <p className="text-muted-foreground mb-4">
                AI estimated you are around <span className="text-primary font-bold">{currentAge}</span>.
                <br />We've estimated your birth year. Is this correct?
            </p>
            <p className="text-xs text-muted-foreground/80 mb-8 max-w-xs mx-auto">
                We use your exact birth chart to understand your potential strengths and shadows.
            </p>

            <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full text-center p-4 rounded-2xl bg-secondary/30 text-2xl font-bold border-2 border-transparent focus:border-primary focus:bg-background transition-all outline-none mb-8"
            />

            <button
                onClick={handleSubmit}
                disabled={!dob || isLoading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Reading Stars...
                    </>
                ) : (
                    "Confirm Date"
                )}
            </button>
        </motion.div>
    );
}
