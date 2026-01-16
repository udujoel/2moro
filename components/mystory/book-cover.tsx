"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { regenerateStory } from "@/app/actions/mystory";
import { useRouter } from "next/navigation";

interface BookCoverProps {
    coverImage?: string;
}

export function BookCover({ coverImage }: BookCoverProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const result = await regenerateStory();
            if (result.success) {
                router.refresh();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error updating story:", error);
            alert("Failed to update story");
        }
        setIsUpdating(false);
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center p-12">
            {/* Update Story Button - Top Right */}
            <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="absolute top-6 right-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                <Sparkles className="w-4 h-4" />
                {isUpdating ? "Updating..." : "Update Story"}
            </button>

            {/* Book Cover */}
            <div className="relative w-full max-w-2xl aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 border-4 border-amber-900/20">
                {/* Cover Image or Default Design */}
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt="Book Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-900/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-900/10 to-transparent" />

                        {/* Title */}
                        <div className="relative z-10 text-center space-y-6">
                            <div className="space-y-2">
                                <div className="text-sm font-serif text-amber-900/60 uppercase tracking-widest">
                                    The Story of
                                </div>
                                <h1 className="text-6xl font-serif font-bold text-amber-900 leading-tight">
                                    My Life
                                </h1>
                            </div>

                            <div className="w-24 h-1 bg-amber-900/30 mx-auto rounded-full" />

                            <p className="text-lg font-serif italic text-amber-900/70">
                                A Journey Through Time
                            </p>
                        </div>

                        {/* Decorative Corner Ornaments */}
                        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-amber-900/20 rounded-tl-lg" />
                        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-amber-900/20 rounded-tr-lg" />
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-amber-900/20 rounded-bl-lg" />
                        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-amber-900/20 rounded-br-lg" />
                    </div>
                )}
            </div>
        </div>
    );
}
