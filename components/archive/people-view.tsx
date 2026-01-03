"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Mic, Image as ImageIcon, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";

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
}

export function PeopleView({ entries, people: initialPeople }: PeopleViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date("2024-10-15")); // Mock start date
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
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
                <div className="relative z-20">
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

            <div className="flex-1 flex bg-background/50 rounded-3xl overflow-hidden border border-border">
                {/* Sidebar: People List or Detail */}
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
                                        <ChevronLeft className="w-4 h-4" /> Back to List
                                    </button>
                                </div>
                                <div className="p-6 text-center space-y-4">
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
                                    <div className="bg-muted/50 rounded-xl p-4 text-left text-sm text-muted-foreground leading-relaxed">
                                        <p>AI Summary: Key figure in your early career. Mentioned in 12 memories. Often associated with "Growth" and "Challenge".</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/30 p-2 rounded-lg text-center">
                                            <p className="text-xs text-muted-foreground">First Met</p>
                                            <p className="font-semibold text-sm">Oct 2023</p>
                                        </div>
                                        <div className="bg-muted/30 p-2 rounded-lg text-center">
                                            <p className="text-xs text-muted-foreground">Memories</p>
                                            <p className="font-semibold text-sm">12</p>
                                        </div>
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
                                        <Plus className="w-4 h-4" /> Add New Person
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Scheduler Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
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
                        {/* Horizontal Rows for People */}
                        {people.filter(p => peopleFilter === 'all' || p.id === peopleFilter).map((person, rowIndex) => (
                            <div key={person.id} className={`h-24 border-b border-border/50 relative flex items-center ${selectedPersonId && selectedPersonId !== person.id ? "opacity-30 grayscale" : "opacity-100"}`}>

                                {/* Simulation: Placing random interactive memories */}
                                {rowIndex === 0 && (
                                    <div
                                        className="absolute left-[28.5%] w-[14%] h-16 z-10 m-0.5 group"
                                        onMouseEnter={() => setHoveredMemory(1)}
                                        onMouseLeave={() => setHoveredMemory(null)}
                                        onClick={() => setEditingMemory(1)}
                                    >
                                        <div className="w-full h-full bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 rounded-xl p-2 flex flex-col justify-center shadow-sm cursor-pointer hover:scale-[1.05] transition-transform">
                                            <p className="text-xs font-bold text-orange-900 dark:text-orange-100 truncate">Mentorship Call</p>
                                        </div>

                                        {/* Hover Popup */}
                                        <AnimatePresence>
                                            {hoveredMemory === 1 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl p-3 z-50 pointer-events-none"
                                                >
                                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Oct 18 • 2:00 PM</p>
                                                    <p className="text-sm font-medium">"Focus on inputs, not outputs."</p>
                                                    <p className="text-xs text-muted-foreground mt-2">Click to edit details.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {rowIndex === 3 && (
                                    <div
                                        className="absolute left-[57%] w-[14%] h-14 z-10 m-0.5 group"
                                        onMouseEnter={() => setHoveredMemory(2)}
                                        onMouseLeave={() => setHoveredMemory(null)}
                                        onClick={() => setEditingMemory(2)}
                                    >
                                        <div className="w-full h-full bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 rounded-xl p-2 flex flex-col justify-center shadow-sm cursor-pointer hover:scale-[1.05] transition-transform">
                                            <p className="text-xs font-bold text-purple-900 dark:text-purple-100 truncate">Launch</p>
                                        </div>

                                        <AnimatePresence>
                                            {hoveredMemory === 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-xl shadow-xl p-3 z-50 pointer-events-none"
                                                >
                                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Oct 21 • 9:00 AM</p>
                                                    <p className="text-sm font-medium">Project Alpha official launch.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Vertical Grid Lines (Background) */}
                                {dates.map((_, colIndex) => (
                                    <div key={colIndex} className="absolute top-0 bottom-0 border-r border-dashed border-border/30 w-px pointer-events-none" style={{ left: `${((colIndex + 1) / 7) * 100}%` }} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Person Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
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
                                        <input type="text" placeholder="Name (e.g. Alex)" className="w-full bg-muted/50 p-3 rounded-xl border border-border" />
                                        <input type="text" placeholder="Relationship (e.g. Mentor)" className="w-full bg-muted/50 p-3 rounded-xl border border-border" />
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
                                    Save Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit/Add Memory Modal */}
            <AnimatePresence>
                {editingMemory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden"
                        >
                            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    <h3 className="font-bold text-sm">Mentorship Call</h3>
                                </div>
                                <button onClick={() => setEditingMemory(null)}><X className="w-4 h-4" /></button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex gap-2 text-xs">
                                    <div className="flex-1 bg-muted p-2 rounded-lg text-center">
                                        <p className="text-muted-foreground mb-1">Date</p>
                                        <p className="font-semibold">Oct 18, 2024</p>
                                    </div>
                                    <div className="flex-1 bg-muted p-2 rounded-lg text-center">
                                        <p className="text-muted-foreground mb-1">Time</p>
                                        <p className="font-semibold">2:00 PM</p>
                                    </div>
                                </div>

                                <textarea
                                    className="w-full h-32 bg-muted/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    defaultValue="Focus on inputs, not outputs. Control what you can control."
                                />

                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingMemory(null)} className="px-4 py-2 text-xs font-medium hover:bg-muted rounded-lg transition-colors">Delete</button>
                                    <button onClick={() => setEditingMemory(null)} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">Save Changes</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
