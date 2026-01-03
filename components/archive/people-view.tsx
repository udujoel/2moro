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
}

interface PeopleViewProps {
    entries: ArchiveEntry[];
}

export function PeopleView({ entries }: PeopleViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date("2024-10-15")); // Mock start date
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock People Index (In reality, this would be derived from entries + user definition)
    const [people, setPeople] = useState<Person[]>([
        { id: "p1", name: "The Mentor", relationship: "Guide", color: "bg-orange-500" },
        { id: "p2", name: "Sarah", relationship: "Partner", color: "bg-pink-500" },
        { id: "p3", name: "Dad", relationship: "Family", color: "bg-blue-500" },
        { id: "p4", name: "Team Alpha", relationship: "Work", color: "bg-purple-500" },
    ]);

    // Generate dates for the header (e.g., 7 days window)
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    return (
        <div className="flex h-full bg-background/50 rounded-3xl overflow-hidden border border-border">
            {/* Sidebar: People List */}
            <div className="w-64 bg-card border-r border-border flex flex-col z-10">
                <div className="h-16 flex items-center px-4 border-b border-border gap-2">
                    <div className="bg-muted p-2 rounded-lg flex-1 flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Search people...</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {people.map(person => (
                        <div key={person.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
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
                    {people.map((person, rowIndex) => (
                        <div key={person.id} className="h-24 border-b border-border/50 relative flex items-center">
                            {/* Render "Memories" across the dates for this person */}
                            {/* Simulation: Placing random memories for demo */}
                            {rowIndex === 0 && (
                                <div className="absolute left-[30%] w-[25%] h-16 bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 rounded-2xl p-3 flex flex-col justify-center shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                                    <p className="text-xs font-bold text-orange-900 dark:text-orange-100 truncate">Mentorship Call</p>
                                    <p className="text-[10px] text-orange-800/70 dark:text-orange-200/70 truncate">"Focus on inputs..."</p>
                                </div>
                            )}

                            {rowIndex === 3 && (
                                <div className="absolute left-[60%] w-[20%] h-14 bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-3 flex flex-col justify-center shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
                                    <p className="text-xs font-bold text-purple-900 dark:text-purple-100 truncate">Project Launch</p>
                                    <p className="text-[10px] text-purple-800/70 dark:text-purple-200/70 truncate">Big milestone!</p>
                                </div>
                            )}

                            {/* Vertical Grid Lines (Background) */}
                            {dates.map((_, colIndex) => (
                                <div key={colIndex} className="absolute top-0 bottom-0 border-r border-dashed border-border/30 w-px" style={{ left: `${((colIndex + 1) / 7) * 100}%` }} />
                            ))}
                        </div>
                    ))}
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
        </div>
    );
}
