"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Calendar, Clock, Eye, GitCompare } from "lucide-react";

interface ArchiveEntry {
    id: number;
    type: "text" | "image";
    content: string;
    caption?: string;
    date: string;
    createdAt: string;
    chapter: string;
    color?: string;
    context?: string;
}

interface TimelineViewProps {
    entries: ArchiveEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
    const [timeRange, setTimeRange] = useState<"30d" | "6m" | "2y" | "all">("all");
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    // Filter based on TimeRange
    const now = new Date();
    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        if (timeRange === "30d") {
            const cutoff = new Date();
            cutoff.setDate(now.getDate() - 30);
            return entryDate >= cutoff;
        }
        if (timeRange === "6m") {
            const cutoff = new Date();
            cutoff.setMonth(now.getMonth() - 6);
            return entryDate >= cutoff;
        }
        if (timeRange === "2y") {
            const cutoff = new Date();
            cutoff.setFullYear(now.getFullYear() - 2);
            return entryDate >= cutoff;
        }
        return true;
    });

    // Sort chronologically
    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Helper to position dots
    // X axis = Date
    // Y axis = Time of day (simulated or real) or just spread
    const getCoordinates = (entry: ArchiveEntry, index: number) => {
        if (sortedEntries.length === 0) return { x: '50%', y: '50%' };

        const dateScore = new Date(entry.date).getTime();
        const minDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date).getTime() : 0;
        const maxDate = sortedEntries.length > 0 ? new Date(sortedEntries[sortedEntries.length - 1].date).getTime() : 0;

        let xPercent = 50;
        // Avoid division by zero
        if (maxDate > minDate) {
            xPercent = ((dateScore - minDate) / (maxDate - minDate)) * 90 + 5; // 5-95% padding
        } else {
            if (sortedEntries.length > 1) {
                xPercent = (index / (sortedEntries.length - 1)) * 90 + 5;
            }
        }

        // Y Position: Flattened to a "strip" area (middle 30% of screen)
        // We use a slight jitter/offset based on time to avoid complete overlap, but visually constrained
        // Center is 50%. Variation +/- 15%
        const dateObj = new Date(entry.createdAt || entry.date);
        const hours = dateObj.getHours();
        const variation = ((hours - 12) / 12) * 20; // -20% to +20%

        let yPercent = 50 + variation;

        // Add random scatter for same-time collisions if needed, simplified here
        return { x: `${xPercent}%`, y: `${yPercent}%` };
    };

    return (
        <div className="w-full h-full flex flex-col bg-background/50 relative overflow-hidden">
            {/* Header / Filter Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border z-20 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">Memory History</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">{sortedEntries.length} memories</span>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-lg">
                    {(["30d", "6m", "2y", "all"] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {range === "all" ? "All Time" : range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scatter Plot Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
                {/* Y-Axis Labels Removed for Cleaner Look */}
                {/* <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-12 text-[10px] text-muted-foreground opacity-50 z-0 pointer-events-none">
                    <span>AM</span>
                    <span>PM</span>
                </div> */}

                {/* Grid Background - Simplified to Strip */}
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    {/* Central Axis Line */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                    {/* Faint Horizontal Bands (optional, purely aesthetic) */}
                    <div className="absolute top-[35%] w-full h-px border-t border-dashed border-border/20" />
                    <div className="absolute top-[65%] w-full h-px border-t border-dashed border-border/20" />
                </div>

                {/* The Dots */}
                <div className="absolute inset-0 pl-12 pr-4 z-10">
                    {sortedEntries.map((entry, index) => {
                        const { x, y } = getCoordinates(entry, index);
                        const isHovered = hoveredId === entry.id;
                        // Use color from entry or default to a cool grey/blue if not present
                        const dotColor = entry.color?.split(' ')[0] || "bg-slate-400";

                        return (
                            <div
                                key={entry.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                style={{ left: x, top: y }}
                                onMouseEnter={() => setHoveredId(entry.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Dot */}
                                <motion.div
                                    className={`
                                        rounded-full cursor-pointer shadow-sm relative z-10 transition-all duration-300
                                        ${isHovered ? "w-6 h-6 ring-4 ring-primary/20 bg-primary" : `w-3 h-3 ${dotColor.replace('bg-', 'bg-')}`}
                                    `}
                                    // Make some dots larger for visual variety if not hovered
                                    style={!isHovered && index % 3 === 0 ? { width: '16px', height: '16px' } : {}}
                                />

                                {/* Popup Card - Adjusted Position and Z-Index */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -20, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            // Fixed clipping: Use portal or ensure container has no overflow hidden if possible. 
                                            // Since we are in an overflow container, we simply position it higher and ensure z-50.
                                            // To truly fix clipping in scrollable area, we'd need a Portal. 
                                            // For this "strip" view, we position slightly differently.
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl z-[100] overflow-hidden"
                                            style={{ minWidth: '280px' }}
                                        >
                                            {/* Card Content */}
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm truncate mr-2">{entry.title || "Memory"}</span>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</span>
                                                </div>

                                                <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                                                    {entry.type === 'text' ? entry.content : (entry.caption || "Visual memory")}
                                                </p>

                                                <div className="flex items-center gap-2 pt-2">
                                                    {/* Avatars */}
                                                    <div className="flex -space-x-2">
                                                        <div className="w-5 h-5 rounded-full bg-blue-500 border border-background shadow-sm" />
                                                        <div className="w-5 h-5 rounded-full bg-purple-500 border border-background shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Minimal Footer */}
                                            <div className="px-4 py-2 bg-muted/30 border-t border-border/50 flex justify-between items-center">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Version 1</span>
                                                <button className="text-xs font-semibold text-primary hover:underline">Details</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Scrubber (Visual Mock) */}
            <div className="h-16 border-t border-border bg-card/30 flex flex-col justify-center px-6 md:px-12 relative">
                {/* Scrubber Track */}
                <div className="w-full h-8 flex items-center gap-1 overflow-hidden opacity-30">
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i} className={`w-0.5 rounded-full bg-foreground ${i % 5 === 0 ? "h-4" : "h-2"}`} />
                    ))}
                </div>

                {/* Selected Window Pill */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-sm px-12 py-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <span className="text-xs font-bold whitespace-nowrap">30 Days Window</span>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-between px-12 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    <span>September</span>
                    <span>October</span>
                    <span>November</span>
                    <span>December</span>
                </div>
            </div>
        </div>
    );
}
