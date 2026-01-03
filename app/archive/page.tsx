"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OmniJournal } from "@/components/archive/omni-journal";
import { ArchiveGrid } from "@/components/archive/archive-grid";
import { TimelineView } from "@/components/archive/timeline-view";
import { PeopleView } from "@/components/archive/people-view";
import { Play } from "lucide-react";
import Link from "next/link";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useState, useEffect } from "react";
import { getMemories, getPeople } from "@/lib/actions";
import { useUser } from "@/components/user-provider";

export default function ArchivePage() {
    const { user } = useUser();
    const [viewMode, setViewMode] = useState<"grid" | "timeline" | "people">("grid");
    const [memories, setMemories] = useState<any[]>([]); // Using any for transition, ideally typed
    const [people, setPeople] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [dbMemories, dbPeople] = await Promise.all([
                    getMemories(user.id),
                    getPeople(user.id)
                ]);

                console.log(`Debug Archive: Parsed ${dbMemories.length} memories and ${dbPeople.length} people for user ${user.id}`);

                // Map DB Memories to UI format
                const mappedMemories = dbMemories.map((m: any) => ({
                    id: m.id,
                    type: m.type as "text" | "image",
                    content: m.content,
                    caption: m.type === 'image' ? m.content : undefined, // Check if this was intended
                    // Fix: Use a placeholder or check if content is a valid URL for image type
                    // Ideally, we should have a separate 'mediaUrl' field, but for now, let's assume content IS the url if image.
                    // If the seed data put text in content for type=image, that's the issue.
                    // Seed data: { type: "image", content: "Sunrise...", ... } -> This is a description, not a URL.
                    // We need a real image source.
                    imageSrc: m.type === 'image' ? (m.content.startsWith('http') ? m.content : `https://placehold.co/600x400?text=${encodeURIComponent(m.content.substring(0, 20))}`) : undefined,
                    date: new Date(m.memoryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    createdAt: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    chapter: "Chapter 1", // Mock
                    color: "bg-blue-500", // Mock
                    people: m.people.map((p: any) => p.name)
                }));

                // Map DB People to UI format
                const mappedPeople = dbPeople.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    relationship: p.relationship || "Connection",
                    color: p.color || "bg-gray-500",
                    avatar: p.avatar,
                    memoriesCount: (p as any)._count?.memories || 0
                }));

                setMemories(mappedMemories);
                setPeople(mappedPeople);
            } catch (e) {
                console.error("Failed to fetch archive data", e);
            }
        };

        fetchData();
    }, [user]);

    // Fallback if no memories (optional: show empty state or keep mock for demo if preferred? -> Let's show empty/loading state or handle in children)
    // Actually, if we just migrated, it's empty. Let's provide at least one "Welcome" memory if empty?
    // Nah, let's stick to true data.

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
                        <div className="bg-muted p-1 rounded-xl flex self-start md:self-auto overflow-x-auto">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Date Added
                            </button>
                            <button
                                onClick={() => setViewMode("timeline")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === "timeline" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Timeline View
                            </button>
                            <button
                                onClick={() => setViewMode("people")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === "people" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                People
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 mt-6 relative overflow-hidden flex flex-col rounded-3xl border border-border bg-card/50">
                        {viewMode === "grid" ? (
                            <div className="overflow-y-auto h-full">
                                <ArchiveGrid entries={memories} />
                            </div>
                        ) : viewMode === "people" ? (
                            <PeopleView entries={memories} people={people} />
                        ) : (
                            <TimelineView entries={memories} />
                        )}
                    </div>
                </main>

                <OmniJournal onNewEntry={(e) => {
                    // In real app, this would optimistic update or re-fetch
                    // For now, let's just log
                    console.log(e);
                    // Trigger refresh if we could
                }} />
            </div>
        </div>
    );
}
