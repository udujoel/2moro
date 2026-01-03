"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool } from "lucide-react";

interface AutobiographyWidgetProps {
    snippets: string[];
}

export function AutobiographyWidget({ snippets }: AutobiographyWidgetProps) {
    const [index, setIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Typing effect speed settings
    const TYPE_SPEED = 50;
    const DELETE_SPEED = 30;
    const PAUSE_DELAY = 3000;

    useEffect(() => {
        if (!snippets || snippets.length === 0) return;

        const currentSnippet = snippets[index % snippets.length];

        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayedText.length < currentSnippet.length) {
                    setDisplayedText(currentSnippet.substring(0, displayedText.length + 1));
                } else {
                    // Finished typing, pause
                    setIsDeleting(true);
                    // Longer pause before deleting
                    return;
                }
            } else {
                // Deleting
                // Wait a bit before starting deletion logic logic is weird in simple timeout loop.
                // Better logic: separate effects? No, simpler.
                if (displayedText.length > 0) {
                    setDisplayedText(currentSnippet.substring(0, displayedText.length - 1));
                } else {
                    // Finished deleting, next snippet
                    setIsDeleting(false);
                    setIndex((prev) => prev + 1);
                }
            }
        }, isDeleting ? (displayedText.length === currentSnippet.length ? PAUSE_DELAY : DELETE_SPEED) : TYPE_SPEED);

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, index, snippets]);

    return (
        <div className="bg-[#7c5cff] text-white rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group shadow-2xl">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-2 mb-6 text-white/80 font-bold uppercase text-xs tracking-wider z-10">
                <PenTool className="w-4 h-4" /> Autobiography
            </div>

            <div className="flex-1 flex items-center justify-center text-center relative z-10">
                <div className="relative font-serif text-xl md:text-2xl text-white italic leading-relaxed min-h-[120px]">
                    &ldquo;{displayedText}&rdquo;
                    <span className="w-0.5 h-6 bg-white ml-1 inline-block animate-blink align-middle" />
                </div>
            </div>

            <div className="text-[10px] text-white/50 text-center uppercase tracking-widest z-10">
                AI Narrative Link
            </div>
        </div>
    );
}
