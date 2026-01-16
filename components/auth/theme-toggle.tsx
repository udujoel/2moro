"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    return (
        <div className={cn("flex items-center gap-1 p-1 bg-muted/30 rounded-full border border-border/50 backdrop-blur-sm", className)}>
            <button
                onClick={() => setTheme("daybreak")}
                className={cn(
                    "p-1.5 rounded-full transition-all duration-300 flex items-center justify-center",
                    theme === "daybreak"
                        ? "bg-background text-yellow-500 shadow-sm"
                        : "text-muted-foreground/50 hover:text-foreground"
                )}
                title="Light Theme"
            >
                <Sun className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={() => setTheme("midnight")}
                className={cn(
                    "p-1.5 rounded-full transition-all duration-300 flex items-center justify-center",
                    theme === "midnight"
                        ? "bg-background text-blue-400 shadow-sm"
                        : "text-muted-foreground/50 hover:text-foreground"
                )}
                title="Dark Theme"
            >
                <Moon className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
