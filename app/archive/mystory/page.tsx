"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ArrowLeft, BookOpen, Share2, Settings, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getBiography, generateMyStory } from "@/lib/mystory";
import { useUser } from "@/components/user-provider";

export default function MyStoryPage() {
    const { user } = useUser();
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadChapters();
    }, [user]);

    const loadChapters = async () => {
        try {
            setLoading(true);
            const data = await getBiography(user!.id);
            const mapped = data.map(c => ({
                id: c.id,
                title: c.title,
                content: c.content,
                date: c.startDate ? new Date(c.startDate).getFullYear() : "Unknown",
                coverImage: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80"
            }));
            setChapters(mapped);
        } catch (e) {
            console.error("Failed to load chapters", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!user) return;
        setGenerating(true);
        try {
            await generateMyStory(user.id);
            await loadChapters();
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    const LoadingState = () => (
        <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading your story...</p>
        </div>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-96 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Your story begins here</h3>
            <p className="text-muted-foreground mb-8">
                Start capturing your memories to let AI weave them into a beautiful biography.
            </p>
            <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
            >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Writing..." : "Generate MyStory"}
            </button>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8f5f2] dark:bg-[#1a1a1a] text-foreground transition-colors duration-500 font-serif">
            <Sidebar className="hidden md:flex border-r border-border/50" />

            <div className="flex-1 flex flex-col relative">
                <header className="h-16 border-b border-border/50 flex items-center px-6 justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/archive" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-semibold text-lg font-sans">MyStory</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleGenerate}
                            className="mr-2 px-4 py-1.5 rounded-full border border-primary/20 text-primary text-xs font-sans font-medium hover:bg-primary/5 flex items-center gap-2"
                            disabled={generating}
                        >
                            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Regenerate
                        </button>
                        <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <Settings className="w-5 h-5" />
                        </button>
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {loading ? <LoadingState /> : (
                        chapters.length === 0 ? <EmptyState /> : (
                            <div className="max-w-4xl mx-auto p-8 md:p-12">
                                {/* Book Cover / Intro */}
                                <div className="text-center mb-16 pt-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
                                    <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-primary">The Journey</h2>
                                    <p className="text-xl text-muted-foreground italic">A living autobiography</p>
                                    <div className="w-24 h-1 bg-primary/20 mx-auto mt-8 rounded-full"></div>
                                </div>

                                {/* Chapters Loop */}
                                <div className="space-y-24">
                                    {chapters.map((chapter, index) => (
                                        <section key={chapter.id} className="relative animate-in fade-in duration-700 slide-in-from-bottom-8 fill-mode-backwards" style={{ animationDelay: `${index * 150}ms` }}>
                                            <div className="absolute -left-12 top-0 hidden md:block text-muted-foreground/30 font-sans text-9xl font-bold -z-10 select-none opacity-20">
                                                {index + 1}
                                            </div>

                                            <div className="mb-8">
                                                <span className="text-sm font-sans tracking-widest uppercase text-muted-foreground block mb-2">{chapter.date}</span>
                                                <h3 className="text-4xl font-bold mb-6 text-foreground/90">{chapter.title}</h3>

                                                {chapter.coverImage && (
                                                    <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 shadow-xl border border-border/10">
                                                        <img src={chapter.coverImage} alt={chapter.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="prose prose-lg dark:prose-invert max-w-none text-xl leading-relaxed opacity-90 font-serif">
                                                {chapter.content.split('\n').map((para: string, i: number) => (
                                                    para.trim() && <p key={i} className="mb-4">{para}</p>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>

                                <div className="mt-24 text-center py-12 border-t border-border/50">
                                    <p className="text-muted-foreground font-sans">End of current story. <br />Add more memories to continue the journey.</p>
                                </div>
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    );
}
