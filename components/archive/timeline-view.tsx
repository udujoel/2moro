"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

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
    title?: string;
}

interface TimelineViewProps {
    entries: ArchiveEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
    const [timeRange, setTimeRange] = useState<"30d" | "6m" | "2y" | "all">("all");
    const [selectedId, setSelectedId] = useState<number | null>(null);

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

    // Get selected entry
    const selectedEntry = sortedEntries.find(e => e.id === selectedId) || null;

    // Dynamic month labels based on data
    const monthLabels = useMemo(() => {
        if (sortedEntries.length === 0) return [];
        const minDate = new Date(sortedEntries[0].date);
        const maxDate = new Date(sortedEntries[sortedEntries.length - 1].date);

        const months: string[] = [];
        const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

        while (current <= maxDate) {
            months.push(current.toLocaleDateString('en-US', { month: 'long' }));
            current.setMonth(current.getMonth() + 1);
        }

        // Limit to 4-6 labels for display
        if (months.length > 6) {
            const step = Math.ceil(months.length / 4);
            return months.filter((_, i) => i % step === 0).slice(0, 4);
        }
        return months.slice(0, 4);
    }, [sortedEntries]);

    // Helper to position dots
    const getCoordinates = (entry: ArchiveEntry, index: number) => {
        if (sortedEntries.length === 0) return { x: '50%', y: '50%' };

        const dateScore = new Date(entry.date).getTime();
        const minDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date).getTime() : 0;
        const maxDate = sortedEntries.length > 0 ? new Date(sortedEntries[sortedEntries.length - 1].date).getTime() : 0;

        let xPercent = 50;
        if (maxDate > minDate) {
            xPercent = ((dateScore - minDate) / (maxDate - minDate)) * 85 + 5; // 5-90% padding
        } else {
            if (sortedEntries.length > 1) {
                xPercent = (index / (sortedEntries.length - 1)) * 85 + 5;
            }
        }

        // Y Position: Scatter across the strip height (15% to 85% of container)
        // Use a combination of time-of-day and a hash of the ID for variety
        const dateObj = new Date(entry.createdAt || entry.date);
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        // Map time (0-24h) to y position (15% to 85%)
        const timeBasedY = ((hours * 60 + minutes) / 1440) * 70 + 15;

        // Add some deterministic jitter based on entry id to prevent overlap
        const jitter = ((entry.id % 7) - 3) * 3;
        let yPercent = timeBasedY + jitter;

        // Clamp to valid range
        yPercent = Math.max(15, Math.min(85, yPercent));

        return { x: `${xPercent}%`, y: `${yPercent}%` };
    };

    // Window label based on time range
    const windowLabel = timeRange === "30d" ? "30 Days" : timeRange === "6m" ? "6 Months" : timeRange === "2y" ? "2 Years" : "All Time";

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
            <div className="flex-1 relative w-full overflow-hidden">
                {/* Y-Axis Labels */}
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-8 text-[10px] text-muted-foreground/50 z-0 pointer-events-none">
                    <span>6 AM</span>
                    <span>2 PM</span>
                    <span>10 PM</span>
                </div>

                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-8 z-0 pointer-events-none">
                    <div className="w-full h-px border-t border-dashed border-border/30" />
                    <div className="w-full h-px border-t border-dashed border-border/30" />
                    <div className="w-full h-px border-t border-dashed border-border/30" />
                </div>

                {/* The Dots */}
                <div className="absolute inset-0 pl-10 pr-4 z-10">
                    {sortedEntries.map((entry, index) => {
                        const { x, y } = getCoordinates(entry, index);
                        const isSelected = selectedId === entry.id;
                        const dotColor = entry.color?.split(' ')[0] || "bg-primary";

                        return (
                            <div
                                key={entry.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                style={{ left: x, top: y }}
                                onClick={() => setSelectedId(isSelected ? null : entry.id)}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.3 }}
                                    className={`
                                        rounded-full shadow-md transition-all duration-200
                                        ${isSelected ? "w-5 h-5 ring-4 ring-primary/30 bg-primary" : `w-3 h-3 ${dotColor} hover:ring-2 hover:ring-primary/20`}
                                    `}
                                    style={!isSelected && index % 4 === 0 ? { width: '14px', height: '14px' } : {}}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Scrubber */}
            <div className="h-14 border-t border-border bg-card/30 flex flex-col justify-center px-4 md:px-8 relative">
                {/* Scrubber Track */}
                <div className="w-full h-6 flex items-center gap-0.5 overflow-hidden opacity-30">
                    {Array.from({ length: 80 }).map((_, i) => (
                        <div key={i} className={`w-0.5 rounded-full bg-foreground ${i % 5 === 0 ? "h-3" : "h-1.5"}`} />
                    ))}
                </div>

                {/* Selected Window Pill */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-sm px-8 py-1.5 flex items-center justify-center">
                    <span className="text-xs font-bold whitespace-nowrap">{windowLabel}</span>
                </div>

                {/* X-Axis Labels - Dynamic */}
                <div className="absolute bottom-0.5 left-0 right-0 flex justify-between px-8 text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    {monthLabels.length > 0 ? monthLabels.map((month, i) => (
                        <span key={i}>{month}</span>
                    )) : (
                        <>
                            <span>Start</span>
                            <span>End</span>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Detail Panel - Shows Selected Memory */}
            <AnimatePresence>
                {selectedEntry && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-14 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-popover/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm truncate mr-2">{selectedEntry.title || "Memory"}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(selectedEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>

                            <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                                {selectedEntry.type === 'text' ? selectedEntry.content : (selectedEntry.caption || "Visual memory")}
                            </p>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex -space-x-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 border border-background shadow-sm" />
                                    <div className="w-5 h-5 rounded-full bg-purple-500 border border-background shadow-sm" />
                                </div>
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="px-4 py-2 bg-muted/30 border-t border-border/50 flex justify-between items-center text-[10px]">
                            <button
                                onClick={() => {
                                    const currentIndex = sortedEntries.findIndex(e => e.id === selectedId);
                                    if (currentIndex > 0) setSelectedId(sortedEntries[currentIndex - 1].id);
                                }}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <ChevronLeft className="w-3 h-3" /> Back
                            </button>
                            <span className="text-muted-foreground">
                                {sortedEntries.findIndex(e => e.id === selectedId) + 1} / {sortedEntries.length}
                            </span>
                            <button
                                onClick={() => {
                                    const currentIndex = sortedEntries.findIndex(e => e.id === selectedId);
                                    if (currentIndex < sortedEntries.length - 1) setSelectedId(sortedEntries[currentIndex + 1].id);
                                }}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            >
                                Next <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
