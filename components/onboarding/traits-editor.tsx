"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TraitsEditorProps {
    onComplete: (data: any) => void;
    initialData: {
        personalityType: string;
        personalityDescription: string;
        meNow: string[];
        me2moro: string[];
    };
}

const COMMON_TRAITS = [
    "Procrastination", "Anxiety", "Discipline", "Confidence",
    "Focus", "Sleep", "Fitness", "Networking", "Saving Money"
];

export function TraitsEditor({ onComplete, initialData }: TraitsEditorProps) {
    const [meNow, setMeNow] = useState(initialData.meNow || []);
    const [me2moro, setMe2moro] = useState(initialData.me2moro || []);

    // Add Inputs
    const [newTrait, setNewTrait] = useState("");
    const [activeCol, setActiveCol] = useState<"now" | "2moro" | null>(null);

    const handleRemove = (list: "now" | "2moro", item: string) => {
        if (list === "now") setMeNow(prev => prev.filter(i => i !== item));
        else setMe2moro(prev => prev.filter(i => i !== item));
    };

    const handleAdd = (list: "now" | "2moro", item: string) => {
        if (!item) return;
        if (list === "now") setMeNow(prev => [...prev, item]);
        else setMe2moro(prev => [...prev, item]);
        setNewTrait("");
        setActiveCol(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl mx-auto p-4 flex flex-col h-full"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                    <Sparkles className="w-4 h-4" />
                    {initialData.personalityType}
                </div>
                <h2 className="text-3xl font-bold">Your Blueprint</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mt-2">
                    {initialData.personalityDescription}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Me Now */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 border-red-500/20 text-red-500">
                        Me Now
                        <span className="text-xs bg-red-500/10 px-2 py-0.5 rounded ml-auto">Current State</span>
                    </h3>

                    <div className="space-y-2">
                        <AnimatePresence>
                            {meNow.map((item, idx) => (
                                <motion.div
                                    key={`${item}-${idx}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 group"
                                >
                                    <span>{item}</span>
                                    <button
                                        onClick={() => handleRemove("now", item)}
                                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {activeCol === "now" ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/20"
                                    placeholder="Add trait..."
                                    value={newTrait}
                                    onChange={e => setNewTrait(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleAdd("now", newTrait)}
                                />
                                <button onClick={() => handleAdd("now", newTrait)}><Plus className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveCol("now")}
                                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        )}
                    </div>
                </div>

                {/* Me 2moro */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 border-green-500/20 text-green-500">
                        Me 2moro
                        <span className="text-xs bg-green-500/10 px-2 py-0.5 rounded ml-auto">Target Self</span>
                    </h3>

                    <div className="space-y-2">
                        <AnimatePresence>
                            {me2moro.map((item, idx) => (
                                <motion.div
                                    key={`${item}-${idx}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 group"
                                >
                                    <span>{item}</span>
                                    <button
                                        onClick={() => handleRemove("2moro", item)}
                                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {activeCol === "2moro" ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/20"
                                    placeholder="Add habit..."
                                    value={newTrait}
                                    onChange={e => setNewTrait(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleAdd("2moro", newTrait)}
                                />
                                <button onClick={() => handleAdd("2moro", newTrait)}><Plus className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveCol("2moro")}
                                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => onComplete({ meNow, me2moro, personalityType: initialData.personalityType })}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-xl"
                >
                    Finalize Blueprint <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
