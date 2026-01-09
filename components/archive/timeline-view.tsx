"use client";

import { useState, useMemo, useRef } from "react";
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
    people?: string[]; // Added people array to interface
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
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
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

        // Use a deterministic hash of the ID to spread dots even if they all have the same timestamp
        // Fallback to index if id is missing to prevent NaN
        const safeId = typeof entry.id === 'number' ? entry.id : index;
        const idHash = (safeId * 9301 + 49297) % 233280;
        const randomFactor = idHash / 233280; // 0.0 to 1.0

        // Add index-based variation to guarantee spread if IDs are sequential/similar
        const indexFactor = (index % 7) / 7; // 0.0 to ~0.85

        // Mix factors:
        // - Time (40%): coarsely places it in the day
        // - Random (30%): random scatter
        // - Index (30%): ensuring neighbors don't overlap
        const dateObj = new Date(entry.createdAt || entry.date);
        const hours = dateObj.getHours() || 0;
        const minutes = dateObj.getMinutes() || 0;
        const timeValue = ((hours * 60 + minutes) / 1440);

        const combinedFactor = (timeValue * 0.4) + (randomFactor * 0.3) + (indexFactor * 0.3);

        // Map to 10% - 90% range (MAXIMIZE vertical space)
        let yPercent = combinedFactor * 80 + 10;

        // Clamp strictly and fallback for NaN
        if (isNaN(yPercent)) yPercent = 50;
        yPercent = Math.max(10, Math.min(90, yPercent));

        return { x: `${xPercent}%`, y: `${yPercent}%` };
    };

    const windowLabel = timeRange === "30d" ? "30 Days" : timeRange === "6m" ? "6 Months" : timeRange === "2y" ? "2 Years" : "All Time";

    // Get currently selected entry for detail view
    const selectedEntry = hoveredId ? sortedEntries.find(e => e.id === hoveredId) : null;

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
                <div className="flex-1 relative w-full overflow-hidden"
                // REMOVED container onMouseMove to fix following-in-void bug
                >
                    {/* Horizontal Guides */}
                    <div className="absolute inset-x-6 top-[15%] h-px border-t border-dashed border-border/20 pointer-events-none" />
                    <div className="absolute inset-x-6 top-[50%] h-px border-t border-dashed border-border/20 pointer-events-none" />
                    <div className="absolute inset-x-6 top-[85%] h-px border-t border-dashed border-border/20 pointer-events-none" />

                    {/* The Dots */}
                    <div className="absolute inset-0 pl-16 pr-8 z-10">
                        {sortedEntries.map((entry, index) => {
                            const { x, y } = getCoordinates(entry, index);
                            // Highlight if hovered OR if it's the selected entry for the sidebar
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
                                        // Update cursor pos immediately
                                        const rect = containerRef.current?.getBoundingClientRect();
                                        if (rect) {
                                            setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        hoverTimeoutRef.current = setTimeout(() => {
                                            setHoveredId(null);
                                        }, 2000);
                                    }}
                                >
                                    {/* Main Dot */}
                                    <motion.div
                                        animate={{ scale: isActive ? 1.5 : 1 }}
                                        className={`
                                            rounded-full cursor-pointer transition-all duration-300
                                            ${isActive ? "ring-4 ring-primary/30 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : `${dotColor} opacity-40 hover:opacity-100 hover:ring-2 hover:ring-white/20`}
                                        `}
                                        style={{ width: isActive ? '16px' : (index % 5 === 0 ? '14px' : '10px'), height: isActive ? '16px' : (index % 5 === 0 ? '14px' : '10px') }}
                                        onClick={() => {
                                            // Click opens sidebar directly or just highlights?
                                            // User said "The box should pop-up touching the cursor... a button for Details"
                                            // So clicking the dot might usually just toggle hover, but let's keep it simple.
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Hover Card */}
                    <AnimatePresence>
                        {hoveredId && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1, x: cursorPos.x + 20, y: cursorPos.y + 20 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }} // Smooth follow
                                className="absolute top-0 left-0 w-64 bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl z-50 overflow-hidden pointer-events-auto"
                                style={{
                                    // Make sure it doesn't go off screen - simplistically handled by container overflow hidden for now,
                                    // but purely absolute within container logic:
                                    // We rely on standard positioning.
                                }}
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

                                    // Map People Names to Person Objects
                                    const entryPeople = entry.people?.map(name => people.find(p => p.name === name) || { name, id: name, color: "bg-gray-500" }).filter(Boolean);

                                    return (
                                        <div className="flex flex-col">
                                            {/* Header Image */}
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

                                                {/* People Tags with Avatars */}
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
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                                        // Find memories composed of this person
                                        const personMemories = sortedEntries.filter(e => e.people?.includes(person.name));

                                        return (
                                            <div className="flex-1 flex flex-col h-full bg-background/50">
                                                {/* Person Header */}
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

                                                {/* Person Memories List */}
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

                                        // Map People
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
                                                    {/* Avatars */}
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
