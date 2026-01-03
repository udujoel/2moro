"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Search, Bell, Globe, Loader2, Calendar, User } from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";
import { searchContent, SearchResult } from "@/app/actions/search";
import { useUser } from "@/components/user-provider";
import { AnimatePresence, motion } from "framer-motion";

export function TopBar({ title = "My Profile" }: { title?: string }) {
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2 && user) {
                startTransition(async () => {
                    const hits = await searchContent(user.id, query);
                    setResults(hits);
                    setIsOpen(true);
                });
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500); // Debounce
        return () => clearTimeout(timer);
    }, [query, user]);

    return (
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-40">

            {/* Breadcrumbs / Page Title */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground hidden md:flex">
                <span>Home</span>
                <span>/</span>
                <span className="text-foreground font-medium">{title}</span>
            </div>

            {/* Center Search - AI Powered */}
            <div className="flex-1 max-w-xl mx-4 md:mx-8 relative group" ref={searchRef}>
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {isPending ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                    placeholder="Search memories... (e.g., 'What did I eat?')"
                    className="w-full h-12 pl-11 pr-4 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
                />

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                        >
                            {results.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No memories found.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {results.map((result) => (
                                        <button key={result.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted text-left transition-colors group">
                                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${result.type === 'memory' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {result.type === 'memory' ? <Calendar className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{result.content}</p>
                                                <p className="text-xs text-muted-foreground">{result.date ? new Date(result.date).toLocaleDateString() : "Person"}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors flex items-center gap-2 text-xs font-semibold bg-secondary/30">
                    <Globe className="w-4 h-4" />
                    EN
                </button>
                <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-background" />
                </button>

                <div className="pl-4 border-l border-border">
                    <ProfileDropdown />
                </div>
            </div>
        </header>
    );
}
