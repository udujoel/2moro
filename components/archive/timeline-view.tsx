"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";

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
    people?: string[];
    imageSrc?: string;
    weather?: any;
}

interface Person {
    id: string;
    name: string;
    avatar?: string;
    relationship?: string;
    color?: string;
}

interface TimelineViewProps {
    entries: ArchiveEntry[];
    people?: Person[];
}

export function TimelineView({ entries, people = [] }: TimelineViewProps) {
    const [timeRange, setTimeRange] = useState<"30d" | "6m" | "2y" | "all">("all");
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    // Use client coordinates for Portal positioning
    const [clientCursorPos, setClientCursorPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // --- AXIS GENERATION LOGIC ---

    // Top X-Axis Labels
    const topAxisLabels = useMemo(() => {
        if (sortedEntries.length === 0) return [];
        const minDate = new Date(sortedEntries[0].date);
        const maxDate = new Date(sortedEntries[sortedEntries.length - 1].date);
        const minTime = minDate.getTime();
        const maxTime = maxDate.getTime();
        const duration = maxTime - minTime;

        // Safety check to avoid division by zero
        if (duration <= 0) return [{ label: minDate.getFullYear().toString(), left: "50%" }];

        const labels: { label: string; left: string }[] = [];

        if (timeRange === "all" || timeRange === "2y") {
            // Show Years
            const startYear = minDate.getFullYear();
            const endYear = maxDate.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
                const yearDate = new Date(year, 0, 1);
                const yearTime = yearDate.getTime();
                if (yearTime >= minTime && yearTime <= maxTime) {
                    const percent = ((yearTime - minTime) / duration) * 85 + 7.5; // Match dot scatter padding
                    labels.push({ label: year.toString(), left: `${percent}%` });
                }
            }
            // If too few labels, maybe show first/last only?
            if (labels.length < 2) {
                return [
                    { label: startYear.toString(), left: "7.5%" },
                    { label: endYear.toString(), left: "92.5%" }
                ];
            }
        } else if (timeRange === "6m") {
            // Show Months
            const current = new Date(minDate);
            current.setDate(1); // Start at beginning of month
            while (current <= maxDate) {
                const time = current.getTime();
                if (time >= minTime) {
                    const percent = ((time - minTime) / duration) * 85 + 7.5;
                    labels.push({ label: current.toLocaleDateString('en-US', { month: 'short' }), left: `${percent}%` });
                }
                current.setMonth(current.getMonth() + 1);
            }
        } else {
            // 30 Days - Show Weeks or Days
            // Let's show every 5 days
            const current = new Date(minDate);
            while (current <= maxDate) {
                const day = current.getDate();
                if (day % 5 === 0 || current.getTime() === minTime) { // Every 5th day or start
                    const percent = ((current.getTime() - minTime) / duration) * 85 + 7.5;
                    labels.push({ label: `${current.getMonth() + 1}/${day}`, left: `${percent}%` });
                }
                current.setDate(current.getDate() + 1);
            }
        }

        return labels;

    }, [sortedEntries, timeRange]);


    // Helper to position dots (Same as before)
    const getCoordinates = (entry: ArchiveEntry, index: number) => {
        if (sortedEntries.length === 0) return { x: '50%', y: '50%' };

        const dateScore = new Date(entry.date).getTime();
        const minDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date).getTime() : 0;
        const maxDate = sortedEntries.length > 0 ? new Date(sortedEntries[sortedEntries.length - 1].date).getTime() : 0;

        let xPercent = 50;
        if (maxDate > minDate) {
            xPercent = ((dateScore - minDate) / (maxDate - minDate)) * 85 + 7.5;
        } else {
            if (sortedEntries.length > 1) {
                xPercent = (index / (sortedEntries.length - 1)) * 85 + 7.5;
            }
        }

        const safeId = typeof entry.id === 'number' ? entry.id : index;
        const idHash = (safeId * 9301 + 49297) % 233280;
        const randomFactor = idHash / 233280;
        const indexFactor = (index % 7) / 7;

        const dateObj = new Date(entry.createdAt || entry.date);
        const hours = dateObj.getHours() || 0;
        const minutes = dateObj.getMinutes() || 0;
        const timeValue = ((hours * 60 + minutes) / 1440);

        const combinedFactor = (timeValue * 0.4) + (randomFactor * 0.3) + (indexFactor * 0.3);

        let yPercent = combinedFactor * 80 + 10;
        if (isNaN(yPercent)) yPercent = 50;
        yPercent = Math.max(10, Math.min(90, yPercent));

        return { x: `${xPercent}%`, y: `${yPercent}%` };
    };

    return (
        <div className="w-full h-full flex flex-col p-6 bg-background/50 relative overflow-hidden" ref={containerRef}>
            {/* Window Container */}
            <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-md border border-border/60 rounded-[2rem] overflow-hidden shadow-2xl relative">

                {/* Upper Control Bar */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-border/30 bg-card/20 z-20">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg tracking-tight">Memories</h3>
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

                    {/* Top Time Axis */}
                    <div className="absolute top-4 inset-x-0 h-6 z-10 pointer-events-none">
                        {topAxisLabels.map((label, i) => (
                            <div
                                key={i}
                                className="absolute text-[10px] font-bold text-muted-foreground/60 -translate-x-1/2"
                                style={{ left: label.left }}
                            >
                                {label.label}
                                {/* Optional Tick Mark */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-2 bg-border/40 mt-1" />
                            </div>
                        ))}
                    </div>

                    {/* Horizontal Time Lines (Y-Axis) */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Morning (6 AM - ~25%) */}
                        <div className="absolute inset-x-6 top-[25%] h-px border-t border-dashed border-border/20">
                            <span className="absolute left-0 -top-2.5 text-[9px] font-medium text-muted-foreground/40 bg-card/50 px-1 rounded">6 AM</span>
                        </div>
                        {/* Afternoon (2 PM - ~58%) */}
                        <div className="absolute inset-x-6 top-[58%] h-px border-t border-dashed border-border/20">
                            <span className="absolute left-0 -top-2.5 text-[9px] font-medium text-muted-foreground/40 bg-card/50 px-1 rounded">2 PM</span>
                        </div>
                        {/* Night (10 PM - ~91%) */}
                        <div className="absolute inset-x-6 top-[91%] h-px border-t border-dashed border-border/20">
                            <span className="absolute left-0 -top-2.5 text-[9px] font-medium text-muted-foreground/40 bg-card/50 px-1 rounded">10 PM</span>
                        </div>
                    </div>


                    {/* The Dots */}
                    <div className="absolute inset-0 z-10">
                        {sortedEntries.map((entry, index) => {
                            const { x, y } = getCoordinates(entry, index);
                            const isHovered = hoveredId === entry.id;
                            const isSelected = selectedEntryId === entry.id;
                            const isActive = isHovered || isSelected;
                            const dotColor = entry.color?.split(' ')[0] || "bg-slate-500";

                            return (
                                <div
                                    key={entry.id}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                    style={{ left: x, top: y }}
                                    onMouseEnter={(e) => {
                                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                        setHoveredId(entry.id);
                                        setClientCursorPos({ x: e.clientX, y: e.clientY });
                                    }}
                                    onMouseLeave={() => {
                                        hoverTimeoutRef.current = setTimeout(() => {
                                            setHoveredId(null);
                                        }, 2000);
                                    }}
                                >
                                    <motion.div
                                        animate={{ scale: isActive ? 1.5 : 1 }}
                                        className={`
                                            rounded-full cursor-pointer transition-all duration-300
                                            ${isActive ? "ring-4 ring-primary/30 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : `${dotColor} opacity-40 hover:opacity-100 hover:ring-2 hover:ring-white/20`}
                                        `}
                                        style={{ width: isActive ? '16px' : (index % 5 === 0 ? '14px' : '10px'), height: isActive ? '16px' : (index % 5 === 0 ? '14px' : '10px') }}
                                        onClick={(e) => {
                                            // Only set as selected if user intends to view details, 
                                            // usually standard click on dot is just feedback, details button is real opener.
                                            // But to be responsive, let's allow it.
                                            // setClientCursorPos({ x: e.clientX, y: e.clientY });
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Portal Hover Card */}
                    {/* Rendered outside the overflow-hidden container to avoid clipping */}
                    <TooltipPortal
                        isOpen={!!hoveredId}
                        x={clientCursorPos.x}
                        y={clientCursorPos.y}
                        onMouseEnter={() => {
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                            hoverTimeoutRef.current = setTimeout(() => {
                                setHoveredId(null);
                            }, 2000);
                        }}
                    >
                        {(() => {
                            const entry = sortedEntries.find(e => e.id === hoveredId);
                            if (!entry) return null;
                            const entryPeople = entry.people?.map(name => people.find(p => p.name === name) || { name, id: name, color: "bg-gray-500" }).filter(Boolean);

                            // Smart Positioning Logic
                            // We don't have the ref of the tooltip here easily before render, but we can assume dimensions
                            // Width ~ 256px (w-64), Height variable but let's assume ~300px max
                            const tooltipWidth = 280; // slightly more for safety
                            const tooltipHeight = 350;

                            const isRightSide = typeof window !== 'undefined' && clientCursorPos.x > window.innerWidth / 2;
                            const isBottomSide = typeof window !== 'undefined' && clientCursorPos.y > window.innerHeight / 2;

                            const xOffset = isRightSide ? -(tooltipWidth + 20) : 20;
                            const yOffset = isBottomSide ? -(tooltipHeight / 2) : 20; // For bottom, we shift up significantly, or just center it vertically?

                            // Let's do simple quadrant flipping
                            // Top-Left: x+20, y+20
                            // Top-Right: x-width-20, y+20
                            // Bottom-Left: x+20, y-height-20
                            // Bottom-Right: x-width-20, y-height-20

                            // Adjust Y calculation 
                            const finalX = isRightSide ? -20 : 20; // We'll apply this relative to the cursor in the style
                            const finalY = isBottomSide ? -20 : 20;

                            // Framer variants for origin
                            const originX = isRightSide ? 1 : 0;
                            const originY = isBottomSide ? 1 : 0;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: isRightSide ? "-100%" : 0, y: isBottomSide ? "-100%" : 0 }}
                                    animate={{ opacity: 1, scale: 1, x: isRightSide ? "-100%" : 0, y: isBottomSide ? "-100%" : 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: isRightSide ? "-100%" : 0, y: isBottomSide ? "-100%" : 0 }}
                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                    style={{
                                        marginLeft: isRightSide ? -10 : 10, // Small gap
                                        marginTop: isBottomSide ? -10 : 10,
                                        transformOrigin: `${originX * 100}% ${originY * 100}%`
                                    }}
                                    className="w-64 bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden pointer-events-auto"
                                >
                                    {entry.imageSrc && (
                                        <div className="h-32 w-full relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={entry.imageSrc} alt="Memory" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-sm line-clamp-2">{entry.title || entry.content}</h4>
                                            <button onClick={() => setHoveredId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                                        </div>

                                        {entryPeople && entryPeople.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {entryPeople.map((p: any) => (
                                                    <div key={p.id || p.name} className="flex items-center gap-1.5 bg-secondary/50 rounded-full pr-2 pl-1 py-0.5 max-w-full">
                                                        <div className={`w-4 h-4 rounded-full ${p.color || "bg-gray-500"} flex items-center justify-center text-[8px] font-bold text-white overflow-hidden shrink-0`}>
                                                            {p.avatar ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                                            ) : p.name[0]}
                                                        </div>
                                                        <span className="text-[10px] font-medium truncate">{p.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEntryId(entry.id);
                                                setHoveredId(null);
                                            }}
                                            className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </TooltipPortal>
                </div>

                {/* Sidebar Detail View */}
                <AnimatePresence>
                    {(selectedEntryId || selectedPersonId) && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => { setSelectedEntryId(null); setSelectedPersonId(null); }}
                                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
                            />

                            {/* Slide-over Panel */}
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute top-0 right-0 bottom-0 w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden"
                            >
                                {selectedPersonId ? (
                                    // *** PERSON DETAIL VIEW ***
                                    (() => {
                                        const person = people.find(p => p.id === selectedPersonId) || { name: "Unknown", id: "unknown", color: "bg-gray-500", avatar: undefined, relationship: "" };
                                        const personMemories = sortedEntries.filter(e => e.people?.includes(person.name));

                                        return (
                                            <div className="flex-1 flex flex-col h-full bg-background/50">
                                                <div className="p-8 border-b border-border flex flex-col items-center justify-center relative bg-card shadow-sm z-10">
                                                    <button
                                                        onClick={() => setSelectedPersonId(null)}
                                                        className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <ChevronLeft className="w-3 h-3" /> Back
                                                    </button>
                                                    <div className={`w-24 h-24 rounded-full ${person.color || "bg-gray-500"} flex items-center justify-center text-3xl font-bold text-white overflow-hidden ring-4 ring-background shadow-lg mb-4`}>
                                                        {person.avatar ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                                                        ) : person.name[0]}
                                                    </div>
                                                    <h2 className="text-xl font-bold">{person.name}</h2>
                                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">{person.relationship || "Contact"}</p>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-2">Memories with {person.name}</h4>
                                                    {personMemories.length > 0 ? personMemories.map(memory => (
                                                        <div
                                                            key={memory.id}
                                                            onClick={() => { setSelectedPersonId(null); setSelectedEntryId(memory.id); }}
                                                            className="p-3 rounded-xl bg-card border border-border hover:shadow-md transition-all cursor-pointer group flex gap-3"
                                                        >
                                                            {memory.imageSrc && (
                                                                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={memory.imageSrc} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{memory.date}</span>
                                                                </div>
                                                                <h5 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{memory.title || memory.content}</h5>
                                                                <p className="text-xs text-muted-foreground line-clamp-1 opacity-70">{memory.content}</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-10 opacity-50">
                                                            <p className="text-sm">No memories found.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })()
                                ) : (
                                    // *** ENTRY DETAIL VIEW ***
                                    (() => {
                                        const entry = sortedEntries.find(e => e.id === selectedEntryId);
                                        if (!entry) return null;

                                        const entryPeople = entry.people?.map(name => people.find(p => p.name === name) || { name, id: name, color: "bg-gray-500" }).filter(Boolean);

                                        return (
                                            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                                                <div className="h-64 relative shrink-0">
                                                    {entry.imageSrc ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={entry.imageSrc} alt="Memory" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className={`w-full h-full ${entry.color || "bg-muted"} flex items-center justify-center p-8`}>
                                                            <p className="text-xl font-serif italic opacity-50 text-center">"{entry.content}"</p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedEntryId(null)}
                                                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>

                                                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                        <h2 className="text-2xl font-bold leading-tight">{entry.title || "Memory Entry"}</h2>
                                                        <p className="opacity-80 text-sm mt-1">{entry.date}</p>
                                                    </div>
                                                </div>

                                                <div className="p-6 space-y-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {entryPeople?.map((p: any) => (
                                                            <button
                                                                key={p.id || p.name}
                                                                onClick={() => p.id && setSelectedPersonId(p.id)}
                                                                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-muted hover:bg-muted/80 rounded-full border border-border transition-colors group"
                                                            >
                                                                <div className={`w-6 h-6 rounded-full ${p.color || "bg-gray-500"} flex items-center justify-center text-[10px] uppercase font-bold text-white overflow-hidden shrink-0`}>
                                                                    {p.avatar ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                                                    ) : p.name[0]}
                                                                </div>
                                                                <span className="text-xs font-semibold group-hover:text-primary transition-colors">{p.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="prose prose-sm dark:prose-invert">
                                                        <p className="text-lg leading-relaxed">{entry.content}</p>
                                                    </div>

                                                    <div className="border-t border-border pt-6 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                                        <div>
                                                            <span className="font-bold block text-foreground mb-1">Weather</span>
                                                            <span>{typeof entry.weather === 'object' ? `${Math.round((entry.weather as any).temp)}° ${(entry.weather as any).condition}` : (entry.weather || "Unknown")}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold block text-foreground mb-1">Created</span>
                                                            <span>{entry.createdAt}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}

// Separate component for Portal to keeping main component clean
function TooltipPortal({ children, x, y, isOpen, onMouseEnter, onMouseLeave }: any) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed z-[9999]"
                    style={{ left: x + 20, top: y + 20 }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {children}
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
