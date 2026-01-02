"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Compass, Radio, BookOpen, Settings, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Compass", icon: Compass, href: "/dashboard" },
    { label: "Oracle", icon: Radio, href: "/simulation" }, // Future module
    { label: "Archive", icon: BookOpen, href: "/archive" }, // Future module
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside
            className={cn("flex flex-col py-6 h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-border bg-card/50",
                isHovered ? "w-64 px-6" : "w-20 px-3",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href="/" className="flex items-center mb-10 px-2 h-10 overflow-hidden">
                <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-primary text-primary" />
                </div>
                <span
                    className={cn(
                        "font-bold text-xl whitespace-nowrap overflow-hidden transition-all duration-300",
                        isHovered ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
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
                            isHovered ? "px-4 justify-start" : "px-0 justify-center",
                            pathname?.startsWith(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        title={!isHovered ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span
                            className={cn(
                                "whitespace-nowrap overflow-hidden transition-all duration-300",
                                isHovered ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-border">
                <button
                    className={cn(
                        "flex items-center py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors overflow-hidden whitespace-nowrap",
                        isHovered ? "px-4 justify-start" : "px-0 justify-center"
                    )}
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span
                        className={cn(
                            "whitespace-nowrap overflow-hidden transition-all duration-300",
                            isHovered ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                        )}
                    >
                        Settings
                    </span>
                </button>
            </div>
        </aside>
    );
}
