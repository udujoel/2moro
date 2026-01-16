"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Mic, Image as ImageIcon, ChevronLeft, ChevronRight, X, Calendar, RefreshCw } from "lucide-react";
import { generateRelationshipInsight, getMemories } from "@/lib/actions";
import { useUser } from "@/components/user-provider";

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
    people?: string[]; // Names of people involved
    title?: string;
}

interface Person {
    id: string;
    name: string;
    avatar?: string;
    relationship: string;
    color: string;
    memoriesCount?: number;
}

interface PeopleViewProps {
    entries: ArchiveEntry[];
    people: Person[];
    initialPersonId?: string | null;
}

export function PeopleView({ entries, people: initialPeople, initialPersonId }: PeopleViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(initialPersonId || null);
    const [hoveredMemory, setHoveredMemory] = useState<number | null>(null);
    const [editingMemory, setEditingMemory] = useState<number | null>(null);
    const [peopleFilter, setPeopleFilter] = useState<"all" | string>("all");

    // Use prop but keep in state for optimistic updates if needed, or just use prop directly?
    // For now, let's use the prop directly for rendering, or init state if we want to add to it locally.
    // Simpler: Use prop. If we add, we should just re-fetch or rely on parent.
    // But to respect the existing "Add" flow which pushed to local state, let's init state.
    const [people, setPeople] = useState<Person[]>(initialPeople);

    // Sync prop changes to state (simple effect)
    // useEffect(() => setPeople(initialPeople), [initialPeople]); 
    // Actually, let's just use the prop derived `people` variable if we don't need to mutate it locally exclusively.
    // The previous implementation had `setPeople` in the Add Modal.
    // Let's keep `people` state for now and initialize it.

    // Correction: The previous code had a mock array in `useState`. 
    // Now we initialize with `initialPeople`.
    // Valid concern: `initialPeople` might be empty initially.

    const selectedPerson = people.find(p => p.id === selectedPersonId);

    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // New State for Person History
    const [personTimeRange, setPersonTimeRange] = useState<"all" | "6m" | "1y">("all");
    const [personMemories, setPersonMemories] = useState<ArchiveEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const { user } = useUser();
    const prevPersonIdRef = useRef<string | null>(null);

    const handleRefreshInsight = async () => {
        if (!selectedPerson || !user) return;
        setInsightLoading(true);
        // FORCE REFRESH = TRUE
        const res = await generateRelationshipInsight(selectedPerson.id, personTimeRange, true);
        setInsight(res);
        setInsightLoading(false);
    };

    useEffect(() => {
        if (selectedPerson && user?.id) {
            setInsightLoading(true);
            setHistoryLoading(true);

            // Fetch Insight
            if (!insight || selectedPerson.id !== prevPersonIdRef.current) {
                // If it's a new person selected, we let the backend decide to return cached or new.
                // We don't force refresh by default.
                generateRelationshipInsight(selectedPerson.id, personTimeRange, false).then(res => {
                    setInsight(res);
                    setInsightLoading(false);
                });
            } else {
                setInsightLoading(false);
            }

            prevPersonIdRef.current = selectedPerson.id;

            // Fetch Memories (Load up to 50 for now)
            // Note: reusing getMemories action which we updated to support personId
            getMemories(1, 50, selectedPerson.id).then((mems: any) => {
                // Map raw DB memories to ArchiveEntry format
                const mappedMems = mems.map((m: any) => ({
                    id: m.id,
                    type: m.type,
                    content: m.content,
                    date: new Date(m.memoryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    title: m.title,
                    createdAt: m.createdAt,
                    people: m.people.map((p: any) => p.name),
                    // raw date for filtering below
                    _rawDate: new Date(m.memoryDate)
                }));

                const now = new Date();
                const filtered = mappedMems.filter((m: any) => {
                    const d = m._rawDate;
                    if (personTimeRange === "6m") {
                        return d >= new Date(now.setMonth(now.getMonth() - 6));
                    }
                    if (personTimeRange === "1y") {
                        return d >= new Date(now.setFullYear(now.getFullYear() - 1));
                    }
                    return true;
                });
                setPersonMemories(filtered);
                setHistoryLoading(false);
            });
        }
    }, [selectedPerson, personTimeRange, user?.id]);

    // Generate dates for the header (e.g., 7 days window)
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    const handlePrevious = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 7);
        setSelectedDate(d);
    };

    const handleNext = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 7);
        setSelectedDate(d);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Top Control Bar */}
            <div className="flex items-center justify-between px-2">
                <div className="relative z-20 flex items-center gap-4">
                    {!selectedPerson && (
                        <div className="relative">
                            <select
                                value={peopleFilter}
                                onChange={(e) => setPeopleFilter(e.target.value)}
                                className="appearance-none bg-card border border-border rounded-full px-6 py-2.5 pr-10 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[200px]"
                            >
                                <option value="all">All People</option>
                                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Time Range Selector - Always Visible */}
                    <div className="flex bg-card border border-border p-1 rounded-full shadow-sm">
                        {(['all', '6m', '1y'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setPersonTimeRange(range)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${personTimeRange === range ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {range === 'all' ? 'All Time' : range.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 bg-card border border-border rounded-full p-1 shadow-sm">
                        <button onClick={handlePrevious} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="flex items-center gap-2 px-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <button onClick={handleNext} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex bg-background/50 rounded-3xl overflow-hidden border border-border">
                {/* Sidebar */}
                <div className="w-80 bg-card border-r border-border flex flex-col z-10 transition-all duration-300">
                    <AnimatePresence mode="wait">
                        {selectedPerson ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="h-16 flex items-center px-4 border-b border-border">
                                    <button
                                        onClick={() => setSelectedPersonId(null)}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Back to Planner
                                    </button>
                                </div>
                                <div className="p-6 text-center space-y-4 overflow-y-auto">
                                    <div className={`w-24 h-24 mx-auto rounded-full ${selectedPerson.color} bg-opacity-20 flex items-center justify-center text-2xl font-bold ring-4 ring-background shadow-xl`}>
                                        {selectedPerson.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={selectedPerson.avatar} alt={selectedPerson.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            selectedPerson.name[0]
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedPerson.name}</h2>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{selectedPerson.relationship}</p>
                                    </div>

                                    {/* AI Insight Box */}
                                    <div className="bg-muted/50 rounded-xl p-4 text-left text-sm text-muted-foreground leading-relaxed min-h-[100px] flex items-center justify-center relative group">
                                        {insightLoading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs">Analyzing History...</span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <p>{insight || "No analysis available yet."}</p>
                                                {/* Refresh Button */}
                                                <button
                                                    onClick={handleRefreshInsight}
                                                    className="absolute -top-2 -right-2 p-1.5 bg-card hover:bg-muted text-muted-foreground rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-border"
                                                    title="Regenerate Analysis">
                                                    <RefreshCw className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/30 p-2 rounded-lg text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setPersonTimeRange('all')}>
                                            {/* Make Memories clickable as requested */}
                                            <p className="text-xs text-muted-foreground">Memories</p>
                                            <p className="font-semibold text-sm">{selectedPerson.memoriesCount || 0}</p>
                                        </div>
                                        <div className="bg-muted/30 p-2 rounded-lg text-center">
                                            <p className="text-xs text-muted-foreground">Status</p>
                                            <p className="font-semibold text-sm">Active</p>
                                        </div>
                                    </div>

                                    {/* Time Range Selector (Restored) */}
                                    <div className="flex bg-muted/30 p-1 rounded-lg">
                                        {(['all', '6m', '1y'] as const).map(range => (
                                            <button
                                                key={range}
                                                onClick={() => setPersonTimeRange(range)}
                                                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${personTimeRange === range ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                            >
                                                {range === 'all' ? 'All Time' : range.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>


                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="h-16 flex items-center px-4 border-b border-border gap-2">
                                    <div className="bg-muted p-2 rounded-lg flex-1 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Search people...</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {people.filter(p => peopleFilter === 'all' || p.id === peopleFilter).map(person => (
                                        <div
                                            key={person.id}
                                            onClick={() => setSelectedPersonId(person.id)}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer group"
                                        >
                                            <div className={`w-10 h-10 rounded-full ${person.color} bg-opacity-20 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-primary/20`}>
                                                {person.avatar ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    person.name[0]
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{person.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{person.relationship}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 border-t border-border">
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-full py-2 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity"
                                    >
                                        <Plus className="w-4 h-4" /> Add Person
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Content Area: Scheduler vs History */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {selectedPerson ? (
                        // Person History View
                        <div className="flex-1 flex flex-col overflow-hidden bg-background">
                            <div className="h-16 flex items-center px-6 border-b border-border justify-between">
                                <h3 className="font-bold text-lg">Memory History</h3>
                                <span className="text-xs text-muted-foreground">{personMemories.length} entries shown</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {historyLoading ? (
                                    <div className="flex h-full items-center justify-center space-x-2">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                ) : personMemories.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                        <p>No memories found for this period.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {personMemories.map(memory => (
                                            <div key={memory.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditingMemory(memory.id)}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">{new Date(memory.date).toLocaleDateString()}</span>
                                                        <h4 className="font-bold text-base mt-0.5">{memory.title || "Untitled Memory"}</h4>
                                                    </div>
                                                    {memory.type === 'image' && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                                </div>
                                                <p className="text-sm text-foreground/80 line-clamp-3">{memory.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Scheduler Grid (Existing Code)
                        <>
                            {/* Date Header */}
                            <div className="h-16 flex border-b border-border">
                                {dates.map((date, i) => (
                                    <div key={i} className={`flex-1 flex flex-col items-center justify-center border-r border-border/50 ${i === 3 ? "bg-primary/5" : ""}`}>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className={`text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full mt-1 ${i === 3 ? "bg-primary text-primary-foreground" : ""}`}>
                                            {date.getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto relative bg-grid-pattern">
                                {people.filter(p => peopleFilter === 'all' || p.id === peopleFilter).map((person, rowIndex) => (
                                    <div key={person.id} className={`h-24 border-b border-border/50 relative flex items-center ${selectedPersonId && selectedPersonId !== person.id ? "opacity-30 grayscale" : "opacity-100"}`}>
                                        {dates.map((date, colIndex) => {
                                            const dayMemories = entries.filter(e => {
                                                const entryDate = new Date(e.date);
                                                return entryDate.getDate() === date.getDate() &&
                                                    entryDate.getMonth() === date.getMonth() &&
                                                    entryDate.getFullYear() === date.getFullYear() &&
                                                    e.people?.includes(person.name);
                                            });

                                            return (
                                                <div key={colIndex} className="absolute top-0 bottom-0 border-r border-dashed border-border/30 w-px" style={{ left: `${((colIndex + 1) / 7) * 100}%`, pointerEvents: 'none' }}>
                                                    {dayMemories.map((memory, mIndex) => (
                                                        <div
                                                            key={memory.id}
                                                            className="absolute w-24 h-12 z-20 group pointer-events-auto"
                                                            style={{
                                                                top: `${10 + (mIndex * 15)}px`,
                                                                left: `-12px`
                                                            }}
                                                            onMouseEnter={() => setHoveredMemory(memory.id)}
                                                            onMouseLeave={() => setHoveredMemory(null)}
                                                            onClick={() => setEditingMemory(memory.id)}
                                                        >
                                                            <div className={`
                                                                w-full h-full rounded-xl p-2 flex flex-col justify-center shadow-sm cursor-pointer hover:scale-[1.05] transition-transform border
                                                                ${mIndex % 2 === 0 ? "bg-orange-100 dark:bg-orange-900/40 border-orange-200" : "bg-purple-100 dark:bg-purple-900/40 border-purple-200"}
                                                            `}>
                                                                <p className="text-[10px] font-bold opacity-80 truncate">{memory.title || "Memory"}</p>
                                                            </div>
                                                            <AnimatePresence>
                                                                {hoveredMemory === memory.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl p-3 z-50 pointer-events-none"
                                                                    >
                                                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{memory.date}</p>
                                                                        <p className="text-sm font-medium line-clamp-2">{memory.content}</p>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* ... Modals (Keep existing) ... */}
            <AnimatePresence>
                {isAddModalOpen && (
                    // ... keep existing
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card w-full max-w-lg rounded-[2rem] shadow-2xl border border-border overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h2 className="text-xl font-bold">Add Person</h2>
                                <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors">
                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <input type="text" placeholder="Name" className="w-full bg-muted/50 p-3 rounded-xl border border-border" />
                                        <input type="text" placeholder="Relationship" className="w-full bg-muted/50 p-3 rounded-xl border border-border" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Initial Memories / Context</label>
                                    <div className="w-full bg-muted/30 border border-border rounded-xl p-3 min-h-[100px] text-sm relative">
                                        <textarea
                                            placeholder="Tell me about this person. Drop some memories or context here to get started..."
                                            className="w-full h-full bg-transparent resize-none focus:outline-none"
                                        />
                                        <button className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform shadow-lg">
                                            <Mic className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        AI will analyze and index these details.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 pt-0">
                                <button onClick={() => setIsAddModalOpen(false)} className="w-full py-4 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity">
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {editingMemory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        {/* Simplified Mock for keeping code valid short term */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card w-full max-w-md rounded-2xl p-4"
                        >
                            <div className="flex justify-between mb-4"><h3 className="font-bold">Memory Details</h3><button onClick={() => setEditingMemory(null)}><X className="w-4 h-4" /></button></div>
                            <p className="text-sm text-muted-foreground">Detailed editing is available in Archive view.</p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
