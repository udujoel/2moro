"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface PageTurnProps {
    children: ReactNode;
    isFlipping: boolean;
    onTurnForward: () => void;
    onTurnBackward: () => void;
    canTurnForward: boolean;
    canTurnBackward: boolean;
}

export function PageTurn({
    children,
    isFlipping,
    onTurnForward,
    onTurnBackward,
    canTurnForward,
    canTurnBackward
}: PageTurnProps) {
    return (
        <div className="relative">
            {/* Book Pages with Shadow */}
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden min-h-[800px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={String(children)}
                        initial={{ rotateY: canTurnForward ? -90 : 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: canTurnForward ? 90 : -90, opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                        }}
                        style={{
                            transformStyle: "preserve-3d",
                            transformOrigin: canTurnForward ? "right center" : "left center"
                        }}
                        className="w-full h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {canTurnBackward && (
                <button
                    onClick={onTurnBackward}
                    disabled={isFlipping}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {canTurnForward && (
                <button
                    onClick={onTurnForward}
                    disabled={isFlipping}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
