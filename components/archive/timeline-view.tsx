"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface ArchiveEntry {
    id: number;
    type: "text" | "image";
    content: string;
    caption?: string;
    date: string; // "YYYY-MM-DD" format preferred for sorting
    createdAt: string;
    chapter: string;
    color?: string;
}

interface TimelineViewProps {
    entries: ArchiveEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
    const [timeRange, setTimeRange] = useState<"6m" | "2y" | "all">("all");
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Mock filtering logic for visual demonstration
    // In a real app, we would filter based on actual Date objects
    const filteredEntries = entries;

    // Sort entries chronologically
    const sortedEntries = [...filteredEntries].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate position percentage based on the first and last date
    const getPosition = (dateStr: string) => {
        if (sortedEntries.length < 2) return 50;
        const start = new Date(sortedEntries[0].date).getTime();
        const end = new Date(sortedEntries[sortedEntries.length - 1].date).getTime();
        const current = new Date(dateStr).getTime();

        if (end === start) return 50;
        return ((current - start) / (end - start)) * 90 + 5; // Keep within 5-95% range
    };

    return (
        <div className="w-full h-full flex flex-col p-6">
            {/* Controls */}
            <div className="flex justify-end mb-12">
                <div className="bg-muted/50 rounded-full p-1 flex gap-1">
                    {(["6m", "2y", "all"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all
                                ${timeRange === range ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}
                            `}
                        >
                            {range === "all" ? "All Time" : range === "6m" ? "6 Months" : "2 Years"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                {/* Horizontal Line */}
                <div className="absolute w-full h-0.5 bg-border rounded-full" />

                {/* Dots */}
                {sortedEntries.map((entry) => {
                    const leftPos = `${getPosition(entry.date)}%`;
                    const isHovered = hoveredId === entry.id;

                    return (
                        <div
                            key={entry.id}
                            className="absolute top-1/2 -translate-y-1/2 group"
                            style={{ left: leftPos }}
                            onMouseEnter={() => setHoveredId(entry.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* The Dot */}
                            <motion.div
                                className={`
                                    w-4 h-4 rounded-full border-2 border-background cursor-pointer relative z-10
                                    ${entry.color ? entry.color.replace('bg-', 'bg-') : "bg-primary"}
                                `}
                                whileHover={{ scale: 1.5 }}
                            />

                            {/* Hover Line */}
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border transition-all duration-300 origin-bottom ${isHovered ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}`} />

                            {/* Popup Card */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: -40, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 w-64 bg-card border border-border rounded-2xl shadow-xl p-4 z-20 pointer-events-none"
                                    >
                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{entry.date}</p>
                                        {entry.type === "text" ? (
                                            <p className="text-sm font-medium line-clamp-3">"{entry.content}"</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={entry.content} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-sm font-medium line-clamp-2">{entry.caption}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Navigation / Info Footer */}
            <div className="mt-auto border-t border-border pt-6 flex justify-between items-center text-sm text-muted-foreground w-full">
                <span>{sortedEntries.length} Memories in view</span>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors"><ChevronLeft className="w-4 h-4" /> Prev</button>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">Next <ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
}
