"use client";

import { useState } from "react";
import { Book, Grid, Clapperboard } from "lucide-react";

interface BiographyViewProps {
    entries: any[];
}

export function BiographyView({ entries }: BiographyViewProps) {
    const [viewMode, setViewMode] = useState<"text" | "graphic" | "cinema">("text");

    const groupedEntries = entries.reduce((acc: any, entry) => {
        const chapter = entry.chapter || "Unfiled";
        if (!acc[chapter]) acc[chapter] = [];
        acc[chapter].push(entry);
        return acc;
    }, {});

    return (
        <div className="flex flex-col h-full bg-card/50 rounded-t-3xl border-t border-x border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("text")}
                        className={`p-2 rounded-md transition-all ${viewMode === "text" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                        title="Book Mode"
                    >
                        <Book className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("graphic")}
                        className={`p-2 rounded-md transition-all ${viewMode === "graphic" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                        title="Graphic Novel Mode"
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("cinema")}
                        className={`p-2 rounded-md transition-all ${viewMode === "cinema" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                        title="Cinema Mode"
                    >
                        <Clapperboard className="w-4 h-4" />
                    </button>
                </div>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {Object.keys(groupedEntries).length} Chapters
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-serif">
                {viewMode === "text" && (
                    <div className="max-w-prose mx-auto space-y-12">
                        {Object.entries(groupedEntries).map(([chapter, items]: [string, any]) => (
                            <div key={chapter}>
                                <h2 className="text-2xl font-bold mb-6 text-center border-b pb-4 border-border/50">{chapter}</h2>
                                <div className="space-y-6">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="leading-relaxed text-lg">
                                            {item.type === "image" ? (
                                                <figure className="my-6">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.content} alt="Memory" className="w-full rounded-sm grayscale hover:grayscale-0 transition-all duration-500" />
                                                    <figcaption className="text-center text-sm italic text-muted-foreground mt-2">{item.caption}</figcaption>
                                                </figure>
                                            ) : (
                                                <p>
                                                    <span className="font-sans text-xs text-muted-foreground mr-2 uppercase tracking-wide float-left mt-1">{item.date}</span>
                                                    {item.content}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === "graphic" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {entries.map((item) => (
                                <div key={item.id} className="border-4 border-foreground bg-card p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-transform">
                                    {item.type === "image" ? (
                                        <div className="h-48 overflow-hidden mb-2 border-b-2 border-foreground">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.content} alt="Panel" className="w-full h-full object-cover contrast-125" />
                                        </div>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 mb-2 border-b-2 border-foreground">
                                            <p className="font-comic text-sm font-bold text-center leading-tight">{item.content}</p>
                                        </div>
                                    )}
                                    <div className="text-xs font-bold uppercase tracking-widest text-right">{item.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === "cinema" && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Clapperboard className="w-16 h-16 mb-4 opacity-20" />
                        <p>Nanobanana Slideshow Engine</p>
                        <p className="text-sm">Generates a movie from your 2025 memories...</p>
                        <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                            Play "2025: The Year of Change"
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
