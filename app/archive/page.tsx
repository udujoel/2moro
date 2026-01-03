"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OmniJournal } from "@/components/archive/omni-journal";
import { ArchiveGrid } from "@/components/archive/archive-grid";
import { TimelineView } from "@/components/archive/timeline-view";
import { Play } from "lucide-react";
import Link from "next/link";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useState } from "react";

export default function ArchivePage() {
    const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

    // Updated Mock Data with distinct dates and colors
    // In a real app, colors could be derived from tags or sentiment analysis
    const entries = [
        {
            id: 1,
            type: "text",
            content: "Today I realized that my fear of failure is just a fear of learning.",
            date: "2025-10-26",
            createdAt: "Oct 26, 2025",
            chapter: "Chapter 24: The Shift",
            color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
        },
        {
            id: 2,
            type: "image",
            content: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1935&auto=format&fit=crop",
            caption: "The old coffee shop where it all started.",
            date: "2015-09-15",
            createdAt: "Yesterday",
            chapter: "Chapter 14: The Early Days",
            context: "Found in upload metadata",
            color: "bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100"
        },
        {
            id: 3,
            type: "text",
            content: "Met with the mentor. He said 'Focus on the inputs, not the outputs'. Changed my perspective entirely.",
            date: "2020-03-12",
            createdAt: "2 days ago",
            chapter: "Chapter 19: Guidance",
            color: "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
        },
        {
            id: 4,
            type: "text",
            content: "First major breakthrough on the project. It works!",
            date: "2023-11-05",
            createdAt: "Today",
            chapter: "Chapter 22: Success",
            color: "bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100"
        },
        {
            id: 5,
            type: "text",
            content: "Feeling lost. The path isn't clear anymore.",
            date: "2018-06-21",
            createdAt: "Last Week",
            chapter: "Chapter 17: The Valley",
            color: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        }
    ];

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
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-0 md:p-6 overflow-hidden flex flex-col relative">
                    <div className="p-6 md:p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Archive</h1>
                            <p className="text-muted-foreground">Your living autobiography.</p>
                        </div>

                        {/* View Switcher */}
                        <div className="bg-muted p-1 rounded-xl flex self-start md:self-auto">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Date Added
                            </button>
                            <button
                                onClick={() => setViewMode("timeline")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "timeline" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Timeline View
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 mt-6 relative overflow-hidden flex flex-col rounded-3xl border border-border bg-card/50">
                        {viewMode === "grid" ? (
                            <div className="overflow-y-auto h-full">
                                <ArchiveGrid entries={entries as any} />
                            </div>
                        ) : (
                            <TimelineView entries={entries as any} />
                        )}
                    </div>
                </main>

                <OmniJournal onNewEntry={(e) => console.log(e)} />
            </div>
        </div>
    );
}
