"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Cloud, Sun, CloudRain, CloudLightning, Snowflake, CloudFog } from "lucide-react";

function WeatherIcon({ icon, className }: { icon: string, className?: string }) {
    switch (icon) {
        case "sun": return <Sun className={className} />;
        case "cloud": return <Cloud className={className} />;
        case "cloud-rain": return <CloudRain className={className} />;
        case "cloud-lightning": return <CloudLightning className={className} />;
        case "snowflake": return <Snowflake className={className} />;
        case "cloud-fog": return <CloudFog className={className} />;
        default: return <Sun className={className} />;
    }
}

interface ArchiveEntry {
    id: number;
    type: "text" | "image";
    content: string;
    caption?: string;
    imageSrc?: string;
    date: string;
    createdAt: string;
    chapter: string;
    color?: string;
    context?: string;
    title?: string;
    weather?: { temp: number, condition: string, icon: string };
}

interface ArchiveGridProps {
    entries: ArchiveEntry[];
}

export function ArchiveGrid({ entries }: ArchiveGridProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {entries.map((entry) => (
                    <motion.div
                        key={entry.id}
                        layoutId={`card-${entry.id}`}
                        onClick={() => setSelectedId(entry.id)}
                        className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-border/50"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Premium Header - Colored or Gradient */}
                        <div className={`p-5 ${entry.color || "bg-gradient-to-br from-indigo-500 to-purple-600"} text-white relative`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{entry.title || "Untitled Memory"}</h3>
                                    <p className="text-xs opacity-80 font-medium">{entry.date}</p>
                                </div>
                                {entry.weather && (
                                    <div className="flex flex-col items-center">
                                        <WeatherIcon icon={entry.weather.icon} className="w-6 h-6 mb-1 opacity-90" />
                                        <span className="text-[10px] font-bold opacity-80">{Math.round(entry.weather.temp)}°</span>
                                    </div>
                                )}
                            </div>

                            {/* Decorative background circle */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                        </div>

                        {/* Content Body */}
                        <div className="p-0">
                            {entry.imageSrc ? (
                                <div className="aspect-[4/3] w-full relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={entry.imageSrc}
                                        alt={entry.title || "Memory"}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="p-6 pt-4 h-40 flex items-center justify-center bg-muted/20">
                                    <p className="font-medium text-lg text-center text-muted-foreground line-clamp-3 leading-relaxed opacity-80 italic">
                                        "{entry.content}"
                                    </p>
                                </div>
                            )}

                            {/* Caption / Footer */}
                            {entry.type === 'image' && (
                                <div className="p-5 pt-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2 font-handwriting">
                                        {entry.content}
                                    </p>
                                </div>
                            )}
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

                                    {entry.type === "image" && entry.imageSrc && (
                                        <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-6">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={entry.imageSrc} alt={entry.caption || "Memory"} className="w-full h-auto" />
                                        </div>
                                    )}

                                    {(!entry.imageSrc || entry.type === "text") ? (
                                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">"{entry.content}"</h2>
                                    ) : (
                                        <p className="text-2xl md:text-3xl font-medium leading-tight">{entry.caption || entry.content}</p>
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
