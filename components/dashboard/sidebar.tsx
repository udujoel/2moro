"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { Compass, Radio, BookOpen, Settings, Play, Moon, Sun, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-provider";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
    { label: "Compass", icon: Compass, href: "/dashboard" },
    { label: "Oracle", icon: Radio, href: "/simulation" }, // Future module
    { label: "Archive", icon: BookOpen, href: "/archive" }, // Future module
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
        }, 2000);
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
            className={cn("flex flex-col py-6 h-screen sticky top-0 ease-in-out border-r border-border bg-card/50",
                isExpanded ? "w-64 px-6 transition-all duration-300" : "w-20 px-3 transition-all duration-1000",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleInteraction}
        >
            <Link href="/" className="flex items-center mb-10 px-2 h-10 overflow-hidden">
                <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-primary text-primary" />
                </div>
                <span
                    className={cn(
                        "font-bold text-xl whitespace-nowrap overflow-hidden transition-all",
                        isExpanded ? "w-auto opacity-100 ml-3 duration-300" : "w-0 opacity-0 ml-0 duration-1000"
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
                            "flex items-center py-3 rounded-xl font-medium transition-colors overflow-hidden whitespace-nowrap",
                            // Adjust padding and justification for centered icons when collapsed
                            isExpanded ? "px-4 justify-start" : "px-0 justify-center",
                            pathname?.startsWith(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

            <div className="pt-6 border-t border-border mt-auto relative space-y-4">
                {/* Theme Switcher - Bottom Left */}
                {isExpanded && (
                    <div className="px-2 flex gap-2">
                        {[
                            { id: "daybreak", icon: Sun, label: "Day" },
                            { id: "midnight", icon: Moon, label: "Night" },
                            { id: "paperback", icon: Book, label: "Paper" }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={(e) => { e.stopPropagation(); setTheme(t.id as any); }}
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
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden border border-border">
                                {profileImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold">A</div>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium text-sm truncate">The Architect</p>
                                <p className="text-xs text-muted-foreground truncate">View Profile</p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link href="/profile" className="flex justify-center group relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden border border-border cursor-pointer transition-transform hover:scale-105">
                            {profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold">A</div>
                            )}
                        </div>
                        {/* Tooltip for collapsed state */}
                        <div className="absolute left-full bottom-0 ml-3 px-3 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            My Profile
                        </div>
                    </Link>
                )}
            </div>
        </aside>
    );
}
