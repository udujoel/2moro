"use client";

import { motion } from "framer-motion";

interface BiographyViewProps {
    entries: any[];
}

const COLORS = [
    "bg-yellow-100 text-yellow-900 border-yellow-200",
    "bg-red-100 text-red-900 border-red-200",
    "bg-blue-100 text-blue-900 border-blue-200",
    "bg-green-100 text-green-900 border-green-200",
    "bg-purple-100 text-purple-900 border-purple-200",
];

const ROTATIONS = [
    "rotate-1", "-rotate-2", "rotate-2", "-rotate-1", "rotate-0"
];

export function BiographyView({ entries }: BiographyViewProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min pb-24">
                {/* Intro Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between aspect-square md:col-span-2 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Cultivate Memory</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your past is a living library. Capture moments to understand your journey.
                        </p>
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
                        ))}
                    </div>
                </motion.div>

                {entries.map((entry, index) => {
                    const colorClass = COLORS[index % COLORS.length];
                    const rotationClass = ROTATIONS[index % ROTATIONS.length];
                    const isLarge = index % 5 === 0 && index !== 0;

                    return (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                            className={`
                                p-6 rounded-3xl shadow-sm border flex flex-col justify-between cursor-pointer transition-all duration-300
                                ${colorClass} 
                                ${rotationClass}
                                ${isLarge ? "md:col-span-2 aspect-video" : "aspect-square"}
                            `}
                        >
                            <div className="flex-1 overflow-hidden">
                                {entry.type === "image" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={entry.content} alt="Memory" className="w-full h-full object-cover rounded-xl mix-blend-multiply opacity-90" />
                                ) : (
                                    <p className={`font-medium ${isLarge ? "text-xl leading-relaxed" : "text-lg leading-snug"}`}>
                                        "{entry.content}"
                                    </p>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-end">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-60">{entry.chapter?.split(":")[0] || "Entry"}</span>
                                <span className="text-xs font-mono opacity-50">{entry.date}</span>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Empty State / Nudge */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[200px]"
                >
                    <p className="text-sm font-medium mb-2">Add a new entry</p>
                    <p className="text-xs opacity-50">Capture a thought, photo, or voice note.</p>
                </motion.div>
            </div>
        </div>
    );
}
