"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { Compass, Radio, BookOpen, Settings, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-provider";

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
                                isExpanded ? "w-auto opacity-100 ml-3 duration-300" : "w-0 opacity-0 ml-0 duration-1000"
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-border mt-auto relative">
                {isExpanded ? (
                    <div className="relative group">
                        <button
                            onClick={() => setIsExpanded(true)} // Keep sidebar open
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
                        </button>

                        {/* Hover Dropdown (Simple implementation) */}
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-muted text-sm cursor-pointer">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center group relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden border border-border cursor-pointer">
                            {profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold">A</div>
                            )}
                        </div>
                        {/* Tooltip-style dropdown for collapsed state */}
                        <div className="absolute left-full bottom-0 ml-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-muted text-sm cursor-pointer">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
