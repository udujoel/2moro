"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OmniJournal } from "@/components/archive/omni-journal";
import { ArchiveGrid } from "@/components/archive/archive-grid";
import { TimelineView } from "@/components/archive/timeline-view";
import { PeopleView } from "@/components/archive/people-view";
import { Play } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast-context";
import { useState, useEffect } from "react";
import { getMemories, getPeople, createMemory } from "@/lib/actions";
import { useUser } from "@/components/user-provider";

export default function ArchivePage() {
    const { user } = useUser();
    const { showToast } = useToast();

    const [viewMode, setViewMode] = useState<"grid" | "timeline" | "people">("grid");
    const [mounted, setMounted] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('archive-view-mode');
        if (saved === 'grid' || saved === 'timeline' || saved === 'people') {
            setViewMode(saved);
        }
    }, []);

    // Save viewMode to localStorage when it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('archive-view-mode', viewMode);
        }
    }, [viewMode, mounted]);

    const [memories, setMemories] = useState<any[]>([]); // Using any for transition, ideally typed
    const [people, setPeople] = useState<any[]>([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const LIMIT = 30;

    const fetchMemories = async (pageNum: number, reset: boolean = false) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const dbMemories = await getMemories(pageNum, LIMIT);

            // Map DB Memories to UI format
            const mappedMemories = dbMemories.map((m: any) => ({
                id: m.id,
                type: m.type as "text" | "image",
                content: m.content,
                caption: m.type === 'image' ? m.content : undefined,
                imageSrc: m.mediaUrl || (m.type === 'image' ? (m.content.startsWith('http') ? m.content : undefined) : undefined),
                date: new Date(m.memoryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                createdAt: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                chapter: "Chapter 1", // Mock
                color: "bg-blue-500", // Mock
                title: m.title,
                weather: m.weather,
                people: m.people.map((p: any) => p.name)
            }));

            if (mappedMemories.length < LIMIT) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (reset) {
                setMemories(mappedMemories);
            } else {
                setMemories(prev => [...prev, ...mappedMemories]);
            }
        } catch (e) {
            console.error("Failed to fetch memories", e);
            showToast("Failed to load memories", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        // Reload page from DB (reset to page 1)
        setPage(1);
        fetchMemories(1, true);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMemories(nextPage, false);
    };

    useEffect(() => {
        if (!user) return;
        // Initial fetch logic

        const initData = async () => {
            // Fetch people separately as they are not paginated yet (or logic differs)
            try {
                const dbPeople = await getPeople();
                // Map DB People...
                const mappedPeople = dbPeople.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    relationship: p.relationship || "Connection",
                    color: p.color || "bg-gray-500",
                    avatar: p.avatar,
                    memoriesCount: (p as any)._count?.memories || 0
                }));
                setPeople(mappedPeople);
            } catch (e) { console.error(e) }

            // Fetch memories page 1
            fetchMemories(1, true);
        };

        initData();
    }, [user]);

    // Fallback if no memories (optional: show empty state or keep mock for demo if preferred? -> Let's show empty/loading state or handle in children)
    // Actually, if we just migrated, it's empty. Let's provide at least one "Welcome" memory if empty?
    // Nah, let's stick to true data.

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col relative">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-between">
                    {/* Desktop Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                        <span>›</span>
                        <span className="text-foreground font-medium">Diary</span>
                    </div>

                    <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-lg">
                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="w-3 h-3 fill-primary text-primary" />
                        </div>
                    </Link>
                </header>

                <main className="flex-1 p-0 md:p-6 overflow-hidden flex flex-col relative">
                    <div className="p-6 md:p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-3xl font-bold">Diary</h1>
                                <Link href="/mystory" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                                    Read MyStory
                                </Link>
                            </div>
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
                            <div className="overflow-y-auto h-full p-4">
                                <ArchiveGrid entries={memories} onDelete={handleRefresh} />

                                {hasMore && (
                                    <div className="flex justify-center py-8">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {isLoading ? "Loading..." : "Load More Memories"}
                                        </button>
                                    </div>
                                )}
                                {!hasMore && memories.length > 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm opacity-60">
                                        You've reached the beginning of time.
                                    </div>
                                )}
                            </div>
                        ) : viewMode === "people" ? (
                            <PeopleView entries={memories} people={people} />
                        ) : (
                            <TimelineView entries={memories} people={people} />
                        )}
                    </div>
                </main>

                <OmniJournal
                    people={people}
                    locationEnabled={user?.preferences?.locationEnabled}
                    onNewEntry={async (entry) => {
                        console.log("ArchivePage: onNewEntry called", { userExists: !!user, entry });
                        if (!user) {
                            console.error("ArchivePage: User is missing during save!");
                            return;
                        }

                        // Optimistic update (optional, but good for UX) - skipping for now to rely on server response

                        const newMemory = await createMemory(
                            entry.content,
                            new Date(), // use current date
                            entry.type,
                            entry.personIds || [], // passed from OmniJournal
                            entry.location, // passed from OmniJournal
                            entry.media // pass media array
                        );

                        if (newMemory) {
                            // Map to UI format
                            const m = newMemory as any;
                            const mappedMemory = {
                                id: m.id,
                                type: m.type as "text" | "image",
                                content: m.content,
                                caption: m.type === 'image' ? m.content : undefined,
                                imageSrc: m.mediaUrl || (m.type === 'image' ? (m.content.startsWith('http') ? m.content : undefined) : undefined),
                                date: new Date(m.memoryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                createdAt: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                chapter: "New Entry", // Mock
                                color: "bg-blue-500", // Mock
                                title: m.title,
                                weather: m.weather as any, // Cast json
                                people: []
                            };

                            setMemories([mappedMemory, ...memories]);
                        }
                    }} />
            </div>
        </div>
    );
}
