"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { Compass, Radio, BookOpen, Settings, Play, Moon, Sun, Book, Navigation, Sparkles, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-provider";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Compass", icon: Compass, href: "/compass" },
    { label: "Oracle", icon: Sparkles, href: "/simulation" },
    { label: "Diary", icon: Book, href: "/archive" },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const { profileImage } = useUser();
    const { theme, setTheme } = useTheme();

    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(() => {
            setIsExpanded(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        setIsExpanded(false);
    };

    const handleInteraction = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        setIsExpanded(true);
    };

    return (
        <aside
            className={cn("flex flex-col py-6 h-screen sticky top-0 ease-in-out border-r border-border bg-card/30 backdrop-blur-xl z-30",
                isExpanded ? "w-64 px-4 transition-all duration-300" : "w-[4.5rem] px-2 transition-all duration-300",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleInteraction}
        >
            <Link href="/" className="flex items-center mb-6 px-1 h-10 overflow-hidden group">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-primary" />
                </div>
                <span
                    className={cn(
                        "font-bold text-lg whitespace-nowrap overflow-hidden transition-all",
                        isExpanded ? "w-auto opacity-100 ml-3 duration-300" : "w-0 opacity-0 ml-0 duration-300"
                    )}
                >
                    2moro
                </span>
            </Link>

            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center py-2.5 rounded-xl font-medium transition-colors overflow-hidden whitespace-nowrap group",
                            // Adjust padding and justification for centered icons when collapsed
                            isExpanded ? "px-3 justify-start" : "px-0 justify-center",
                            pathname?.startsWith(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                        title={!isExpanded ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span
                            className={cn(
                                "whitespace-nowrap overflow-hidden transition-all",
                                "w-auto opacity-100 ml-3 duration-300"
                            )}
                            style={{
                                width: isExpanded ? "auto" : "0",
                                opacity: isExpanded ? 1 : 0,
                                marginLeft: isExpanded ? "0.75rem" : "0"
                            }}
                        >
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* MyStory Quick Link - Above horizontal line */}
            <Link
                href="/mystory"
                className={cn(
                    "flex items-center py-2.5 rounded-xl font-medium transition-colors overflow-hidden whitespace-nowrap group mt-auto mb-2",
                    isExpanded ? "px-3 justify-start" : "px-0 justify-center",
                    pathname === "/mystory"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                title={!isExpanded ? "MyStory" : undefined}
            >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span
                    className={cn(
                        "whitespace-nowrap overflow-hidden transition-all",
                        "w-auto opacity-100 ml-3 duration-300"
                    )}
                    style={{
                        width: isExpanded ? "auto" : "0",
                        opacity: isExpanded ? 1 : 0,
                        marginLeft: isExpanded ? "0.75rem" : "0"
                    }}
                >
                    MyStory
                </span>
            </Link>

            <div className="pt-6 border-t border-border relative space-y-4">
                {/* Theme Switcher - Bottom Left */}
                {/* Always render, hide with css if needed, or better: show simplified when collapsed? 
                    Design says "bottom-left of sidebar". 
                    If collapsed, we can show a single cycle button or just hide it.
                    Let's revert to showing it ONLY when expanded as per request "above profile".
                */}
                {isExpanded && (
                    <div className="px-2 flex gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {[
                            { id: "daybreak", icon: Sun, label: "Day" },
                            { id: "midnight", icon: Moon, label: "Night" },
                            { id: "paperback", icon: Book, label: "Paper" }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setTheme(t.id as any);
                                }}
                                className={cn(
                                    "p-2 rounded-lg hover:bg-muted text-xs font-medium border border-border flex-1 flex flex-col items-center gap-1 transition-all",
                                    theme === t.id ? "bg-primary/10 border-primary text-primary" : "text-muted-foreground"
                                )}
                                title={t.label}
                            >
                                <t.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                )}

                {isExpanded ? (
                    <Link href="/profile" className="block relative group">
                        <div
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted/50 transition-colors text-left border border-transparent hover:border-border"
                        >
                            <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden border border-border shrink-0">
                                {profileImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xs">A</div>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-sm truncate">The Architect</p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">View Profile</p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link href="/profile" className="flex justify-center group relative px-1">
                        <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden border border-border cursor-pointer transition-transform hover:scale-105">
                            {profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold">A</div>
                            )}
                        </div>
                        {/* Tooltip for collapsed state */}
                        <div className="absolute left-full bottom-0 ml-4 px-2 py-1 bg-foreground/90 text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            My Profile
                        </div>
                    </Link>
                )}
            </div>
        </aside>
    );
}
