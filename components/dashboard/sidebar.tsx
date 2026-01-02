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
            className={cn("flex flex-col p-6 h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-border bg-card/50",
                isHovered ? "w-64" : "w-24",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href="/" className="flex items-center gap-3 font-bold text-xl mb-10 px-2 overflow-hidden h-10">
                <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-primary text-primary" />
                </div>
                <span className={cn("transition-opacity duration-300 whitespace-nowrap", isHovered ? "opacity-100" : "opacity-0")}>
                    2moro
                </span>
            </Link>

            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors overflow-hidden whitespace-nowrap",
                            pathname?.startsWith(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        title={!isHovered ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className={cn("transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0")}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-border">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors overflow-hidden whitespace-nowrap">
                    <Settings className="w-5 h-5 shrink-0" />
                    <span className={cn("transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0")}>
                        Settings
                    </span>
                </button>
            </div>
        </aside>
    );
}
