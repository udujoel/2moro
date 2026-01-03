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

    // Sort chronologically
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Helper to position dots
    // X axis = Date
    // Y axis = Time of day (simulated or real) or just spread
    const getCoordinates = (entry: ArchiveEntry, index: number) => {
        // X Position: Distribution across the timeline
        // In a real app, this would be proportional to the date within the range
        // For visual distribution in this demo, we can just spread them or simulate date math

        const dateScore = new Date(entry.date).getTime();
        const minDate = new Date(sortedEntries[0].date).getTime();
        const maxDate = new Date(sortedEntries[sortedEntries.length - 1].date).getTime();

        let xPercent = 50;
        if (maxDate !== minDate) {
            xPercent = ((dateScore - minDate) / (maxDate - minDate)) * 80 + 10; // 10-90% padding
        }

        // Y Position: Random-ish spread or based on ID/Length to prevent collision
        // Simulating "Time of Day" spread (top=morning, bottom=night)
        const pseudoTime = (entry.id * 17) % 100; // Deterministic random
        const yPercent = 20 + (pseudoTime * 0.6); // 20% to 80% height

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
                {/* Y-Axis Labels (Time Context) */}
                <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-12 text-[10px] text-muted-foreground opacity-50 z-0 pointer-events-none">
                    <span>6 AM</span>
                    <span>2 PM</span>
                    <span>10 PM</span>
                </div>

                {/* Grid Background */}
                <div className="absolute inset-0 flex z-0 pointer-events-none pl-12 pr-4">
                    {/* Horizontal Dashed Lines */}
                    <div className="absolute top-[20%] w-full h-px border-t border-dashed border-border/50" />
                    <div className="absolute top-[50%] w-full h-px border-t border-dashed border-border/50" />
                    <div className="absolute top-[80%] w-full h-px border-t border-dashed border-border/50" />

                    {/* Vertical Dashed Columns */}
                    <div className="flex-1 border-r border-dashed border-border/30 h-full" />
                    <div className="flex-1 border-r border-dashed border-border/30 h-full" />
                    <div className="flex-1 border-r border-dashed border-border/30 h-full" />
                    <div className="flex-1 border-r border-dashed border-border/30 h-full" />
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

                                {/* Popup Card */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -20, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-card border border-border/50 rounded-xl shadow-2xl p-0 z-50 overflow-hidden"
                                        >
                                            {/* Card Content */}
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm">Memory #{entry.id}</span>
                                                    <span className="text-xs text-muted-foreground">{entry.createdAt}</span>
                                                </div>

                                                <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                                                    {entry.type === 'text' ? entry.content : entry.caption}
                                                </p>

                                                {/* Mini Avatars/Metadata style */}
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-card" />
                                                        <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-card" />
                                                    </div>
                                                    <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-[10px]">✓</div>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex items-center gap-2 px-3 py-2 border-t border-border/50 bg-muted/20">
                                                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg border border-border/50 bg-background text-xs font-semibold hover:bg-muted transition-colors">
                                                    <GitCompare className="w-3 h-3" /> Compare
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg border border-border/50 bg-background text-xs font-semibold hover:bg-muted transition-colors">
                                                    <Eye className="w-3 h-3" /> Details
                                                </button>
                                            </div>

                                            {/* Pagination Footer */}
                                            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 text-[10px] text-muted-foreground font-medium">
                                                <button className="flex items-center hover:text-foreground"><ChevronLeft className="w-3 h-3 mr-1" /> Back</button>
                                                <span>1 / 1</span>
                                                <button className="flex items-center hover:text-foreground">Next <ChevronRight className="w-3 h-3 ml-1" /></button>
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
