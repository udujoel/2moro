"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, GitCompare, Eye } from "lucide-react";

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
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
            xPercent = ((dateScore - minDate) / (maxDate - minDate)) * 85 + 7.5; // Padding
        } else {
            if (sortedEntries.length > 1) {
                xPercent = (index / (sortedEntries.length - 1)) * 85 + 7.5;
            }
        }

        // Y Position: Scatter
        const dateObj = new Date(entry.createdAt || entry.date);
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        // Map time (0-24h) to y position (20% to 80%)
        const timeBasedY = ((hours * 60 + minutes) / 1440) * 60 + 20;

        // Jitter based on ID
        const jitter = ((entry.id % 11) - 5) * 2;
        let yPercent = timeBasedY + jitter;

        yPercent = Math.max(20, Math.min(80, yPercent));

        return { x: `${xPercent}%`, y: `${yPercent}%` };
    };

    const windowLabel = timeRange === "30d" ? "30 Days" : timeRange === "6m" ? "6 Months" : timeRange === "2y" ? "2 Years" : "All Time";

    return (
        <div className="w-full h-full flex flex-col p-6 bg-background/50 relative overflow-hidden" ref={containerRef}>
            {/* Window Container */}
            <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-md border border-border/60 rounded-[2rem] overflow-hidden shadow-2xl relative">

                {/* Upper Control Bar (Simulated inside window) */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-border/30 bg-card/20 z-20">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg tracking-tight">Version History</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">{sortedEntries.length} entries</span>
                    </div>

                    <div className="flex bg-muted/30 p-1.5 rounded-xl border border-border/20">
                        {(["30d", "6m", "2y", "all"] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${timeRange === range ? "bg-background shadow-lg text-foreground ring-1 ring-border/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                            >
                                {range === "all" ? "All time" : range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plot Area */}
                <div className="flex-1 relative w-full overflow-hidden">
                    {/* Time Scale Labels */}
                    <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-between py-12 text-[10px] font-bold text-muted-foreground/30 z-0 pointer-events-none uppercase tracking-tighter">
                        <span>6 am</span>
                        <span>2 pm</span>
                        <span>10 pm</span>
                    </div>

                    {/* Horizontal Guides */}
                    <div className="absolute inset-0 flex flex-col justify-between py-12 z-0 pointer-events-none px-6">
                        <div className="w-full h-px border-t border-dashed border-border/20" />
                        <div className="w-full h-px border-t border-dashed border-border/20" />
                        <div className="w-full h-px border-t border-dashed border-border/20" />
                    </div>

                    {/* The Dots */}
                    <div className="absolute inset-0 pl-16 pr-8 z-10">
                        {sortedEntries.map((entry, index) => {
                            const { x, y } = getCoordinates(entry, index);
                            const isHovered = hoveredId === entry.id;
                            const dotColor = entry.color?.split(' ')[0] || "bg-slate-500";

                            return (
                                <div
                                    key={entry.id}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                    style={{ left: x, top: y }}
                                    onMouseEnter={() => setHoveredId(entry.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    {/* Main Dot */}
                                    <motion.div
                                        animate={{ scale: isHovered ? 1.5 : 1 }}
                                        className={`
                                            rounded-full cursor-pointer transition-all duration-300
                                            ${isHovered ? "ring-4 ring-primary/30 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : `${dotColor} opacity-40 hover:opacity-100 hover:ring-2 hover:ring-white/20`}
                                        `}
                                        style={{ width: isHovered ? '16px' : (index % 5 === 0 ? '14px' : '10px'), height: isHovered ? '16px' : (index % 5 === 0 ? '14px' : '10px') }}
                                    />

                                    {/* Hover Card */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: -15, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-popover/90 backdrop-blur-xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl z-[100] overflow-hidden"
                                            >
                                                <div className="p-5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-foreground truncate">{entry.title || "Version " + entry.id}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight mt-0.5">
                                                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {entry.type === 'text' ? entry.content : (entry.caption || "Media entry captured in MyStory.")}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-1">
                                                        <div className="flex -space-x-2.5">
                                                            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-background shadow-sm overflow-hidden" />
                                                            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-background shadow-sm overflow-hidden" />
                                                        </div>
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[8px] text-emerald-500">✓</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 p-3 bg-muted/20 border-t border-border/40">
                                                    <button className="flex-1 py-1.5 rounded-lg border border-border/40 bg-background/50 text-[11px] font-bold hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
                                                        <GitCompare className="w-3 h-3" /> Compare
                                                    </button>
                                                    <button className="flex-1 py-1.5 rounded-lg border border-border/40 bg-background/50 text-[11px] font-bold hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
                                                        <Eye className="w-3 h-3" /> Details
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between px-4 py-2 bg-muted/40 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-t border-border/20">
                                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors"><ChevronLeft className="w-3 h-3" /> Back</button>
                                                    <span className="opacity-60">1 / 5</span>
                                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">Next <ChevronRight className="w-3 h-3" /></button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Scrubber */}
                <div className="h-28 border-t border-border/30 bg-card/10 flex flex-col items-center justify-center px-12 relative overflow-hidden">
                    {/* Tick Marks Container */}
                    <div className="w-full h-12 flex items-center gap-1.5 overflow-hidden opacity-20">
                        {Array.from({ length: 120 }).map((_, i) => (
                            <div key={i} className={`w-0.5 rounded-full bg-foreground ${i % 10 === 0 ? "h-6 opacity-80" : i % 5 === 0 ? "h-4 opacity-50" : "h-2 opacity-30"}`} />
                        ))}
                    </div>

                    {/* Window Pill */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] px-10 py-2.5 flex items-center justify-center cursor-default z-10 transition-transform active:scale-95">
                            <span className="text-xs font-black uppercase tracking-[0.2em]">{windowLabel}</span>
                        </div>
                    </div>

                    {/* Month Labels - Positioned relative to ticks */}
                    <div className="absolute bottom-4 left-12 right-12 flex justify-between text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                        {monthLabels.length > 0 ? monthLabels.map((month, i) => (
                            <span key={i}>{month}</span>
                        )) : (
                            <>
                                <span>September</span>
                                <span>October</span>
                                <span>November</span>
                                <span>December</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
