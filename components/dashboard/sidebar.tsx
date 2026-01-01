"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Radio, BookOpen, Settings, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "The Compass", icon: Compass, href: "/dashboard" },
    { label: "The Oracle", icon: Radio, href: "/simulation" }, // Future module
    { label: "The Archive", icon: BookOpen, href: "/archive" }, // Future module
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn("flex flex-col p-6 h-screen sticky top-0", className)}>
            <Link href="/" className="flex items-center gap-3 font-bold text-xl mb-10 px-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                    <Play className="w-3 h-3 fill-primary text-primary" />
                </div>
                2moro
            </Link>

            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                            pathname?.startsWith(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-border">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors">
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </aside>
    );
}
