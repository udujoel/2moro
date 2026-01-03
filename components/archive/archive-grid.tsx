"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

interface ArchiveEntry {
    id: number;
    type: "text" | "image";
    content: string;
    caption?: string;
    date: string; // The memory's date
    createdAt: string; // Date added
    chapter: string;
    color?: string; // For the colorful card background
    context?: string;
}

interface ArchiveGridProps {
    entries: ArchiveEntry[];
}

export function ArchiveGrid({ entries }: ArchiveGridProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {entries.map((entry) => (
                    <motion.div
                        key={entry.id}
                        layoutId={`card-${entry.id}`}
                        onClick={() => setSelectedId(entry.id)}
                        className={`
                            relative aspect-square rounded-3xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-shadow overflow-hidden
                            flex flex-col justify-between
                            ${entry.color || "bg-card border border-border"}
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Card Content Preview */}
                        <div className="z-10">
                            <p className="text-xs font-bold uppercase opacity-70 mb-2">{entry.chapter}</p>
                            {entry.type === "text" ? (
                                <p className="font-semibold text-lg line-clamp-4 leading-relaxed">"{entry.content}"</p>
                            ) : (
                                <div className="w-full h-full absolute inset-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={entry.content} alt={entry.caption} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                                        <p className="text-white font-medium line-clamp-2">{entry.caption}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date Added Footer */}
                        <div className="relative z-10 mt-auto pt-4">
                            <p className="text-xs opacity-60">Added {entry.createdAt}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedId(null)}
                    >
                        {entries.filter(e => e.id === selectedId).map(entry => (
                            <motion.div
                                key={entry.id}
                                layoutId={`card-${entry.id}`}
                                className={`
                                    w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-8 md:p-12 shadow-2xl relative
                                    ${entry.color || "bg-card"} 
                                `}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-sm font-medium opacity-60 uppercase tracking-widest">
                                        <span>{entry.chapter}</span>
                                        <span>•</span>
                                        <span>{entry.date}</span>
                                    </div>

                                    {entry.type === "image" && (
                                        <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-6">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={entry.content} alt={entry.caption} className="w-full h-auto" />
                                        </div>
                                    )}

                                    {entry.type === "text" ? (
                                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">"{entry.content}"</h2>
                                    ) : (
                                        <p className="text-2xl md:text-3xl font-medium leading-tight">{entry.caption}</p>
                                    )}

                                    <div className="pt-8 border-t border-black/10 mt-8 flex flex-col gap-2 opacity-60">
                                        <p className="text-sm">Context: {entry.context || "No additional context."}</p>
                                        <p className="text-xs">Added on {entry.createdAt}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
