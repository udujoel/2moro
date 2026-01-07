"use client";

import { useState, useEffect } from "react";

interface AutobiographyWidgetProps {
    snippets: string[];
}

export function AutobiographyWidget({ snippets }: AutobiographyWidgetProps) {
    const [index, setIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEllipsis, setShowEllipsis] = useState(false);

    // Typing effect speed settings
    const TYPE_SPEED = 50;
    const DELETE_SPEED = 30;
    const PAUSE_DELAY = 2000;
    const ELLIPSIS_DELAY = 1500;
    const MAX_CHARS = 120; // Character limit before showing ellipsis

    useEffect(() => {
        if (!snippets || snippets.length === 0) return;

        const currentSnippet = snippets[index % snippets.length];

        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayedText.length < currentSnippet.length) {
                    const nextChar = displayedText.length + 1;

                    // Check if we're approaching the limit
                    if (nextChar > MAX_CHARS && !showEllipsis) {
                        setShowEllipsis(true);
                        // Wait before starting to delete
                        setTimeout(() => {
                            setIsDeleting(true);
                            setShowEllipsis(false);
                        }, ELLIPSIS_DELAY);
                        return;
                    }

                    if (nextChar <= MAX_CHARS) {
                        setDisplayedText(currentSnippet.substring(0, nextChar));
                    }
                } else {
                    // Finished typing, pause
                    setTimeout(() => {
                        setIsDeleting(true);
                    }, PAUSE_DELAY);
                    return;
                }
            } else {
                // Deleting
                if (displayedText.length > 0) {
                    setDisplayedText(currentSnippet.substring(0, displayedText.length - 1));
                } else {
                    // Finished deleting, next snippet
                    setIsDeleting(false);
                    setIndex((prev) => prev + 1);
                }
            }
        }, isDeleting ? DELETE_SPEED : TYPE_SPEED);

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, index, snippets, showEllipsis]);

    return (
        <div className="bg-[#7c5cff] text-white rounded-3xl p-6 h-full flex flex-col relative overflow-hidden shadow-2xl">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex-1 flex items-center justify-center text-center relative z-10 px-2">
                <div className="relative font-serif text-lg md:text-xl text-white italic leading-relaxed overflow-hidden">
                    &ldquo;{displayedText}{showEllipsis && "..."}&rdquo;
                    <span className="w-0.5 h-5 bg-white ml-1 inline-block animate-blink align-middle" />
                </div>
            </div>
        </div>
    );
}
