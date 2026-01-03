"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Sparkles, Loader2 } from "lucide-react";
import { useUser } from "@/components/user-provider"; // Using our context to get UserID
import { analyzeImageAndCreateMemory } from "@/app/actions/onboarding";

interface IcebreakerProps {
    onComplete: (data: any) => void;
}

export function Icebreaker({ onComplete }: IcebreakerProps) {
    const { user } = useUser();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        setIsAnalyzing(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await analyzeImageAndCreateMemory(user.id, formData);
            if (result.success && result.avatar) {
                // Wait a bit to show the "Analyzing" animation
                setTimeout(() => {
                    setIsAnalyzing(false);
                    onComplete({
                        image: result.avatar,
                        age: result.predictedAge || 25,
                        vibe: result.predictedVibe || "Explorer"
                    });
                }, 1500);
            } else {
                console.error(result.error);
                setIsAnalyzing(false);
            }
        } catch (err) {
            console.error(err);
            setIsAnalyzing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center max-w-md w-full"
        >
            <h2 className="text-3xl font-bold mb-4">First, let's see who you are.</h2>
            <p className="text-muted-foreground mb-8">
                Upload a photo. Our neural engine will calibrate your profile based on your visual signature.
            </p>

            <div className="relative group cursor-pointer w-64 h-64">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />

                <div className={`w-full h-full rounded-full border-4 border-dashed border-border flex flex-col items-center justify-center bg-secondary/20 transition-all group-hover:bg-secondary/40 group-hover:border-primary/50 overflow-hidden relative ${isAnalyzing ? "animate-pulse border-primary" : ""}`}>
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <Camera className="w-12 h-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                            <span className="text-sm font-medium text-muted-foreground">Tap to Upload</span>
                        </>
                    )}

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Sparkles className="w-8 h-8 text-primary animate-spin mb-2" />
                            <span className="text-sm font-bold text-primary">Analyzing Aura...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Age Estimation</span>
                </div>
                <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Personality Inference</span>
                </div>
            </div>
        </motion.div>
    );
}
