"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OmniJournal } from "@/components/archive/omni-journal";
import { BiographyView } from "@/components/archive/biography-view";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ArchivePage() {
    const [entries, setEntries] = useState<any[]>([
        { id: 1, type: "text", content: "Today I realized that my fear of failure is just a fear of learning.", date: "Oct 26, 2025", chapter: "Chapter 24: The Shift" },
        { id: 2, type: "image", content: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1935&auto=format&fit=crop", caption: "The old coffee shop where it all started.", date: "Sep 15, 2015", chapter: "Chapter 14: The Early Days", context: "Found in upload metadata" }
    ]);

    const addEntry = (entry: any) => {
        setEntries([entry, ...entries]);
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col relative">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-lg">
                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="w-3 h-3 fill-primary text-primary" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Hello, Architect</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20" />
                    </div>
                </header>

                <main className="flex-1 p-0 md:p-6 overflow-hidden flex flex-col relative">
                    <div className="p-6 md:p-0">
                        <h1 className="text-3xl font-bold">Archive</h1>
                        <p className="text-muted-foreground">Your living autobiography.</p>
                    </div>

                    <div className="flex-1 mt-6 relative overflow-hidden flex flex-col">
                        <BiographyView entries={entries} />
                    </div>
                </main>

                <OmniJournal onNewEntry={addEntry} />
            </div>
        </div>
    );
}
