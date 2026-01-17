"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor } from "lucide-react";

export function AppearanceSection() {
    const { setTheme, theme } = useTheme();

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Appearance</h2>
                <p className="text-sm text-muted-foreground mt-1">Customize how 2moro looks on your device.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={() => setTheme("daybreak")}
                    className={cn(
                        "group flex items-center gap-4 p-3 rounded-xl border transition-all text-left",
                        theme === "daybreak"
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:bg-muted"
                    )}
                >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <Sun className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <span className="block font-medium text-sm">Daybreak</span>
                        <span className="text-xs text-muted-foreground">Light theme</span>
                    </div>
                </button>

                <button
                    onClick={() => setTheme("midnight")}
                    className={cn(
                        "group flex items-center gap-4 p-3 rounded-xl border transition-all text-left",
                        theme === "midnight"
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:bg-muted"
                    )}
                >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <Moon className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <span className="block font-medium text-sm">Midnight</span>
                        <span className="text-xs text-muted-foreground">Dark theme</span>
                    </div>
                </button>

                <button
                    onClick={() => setTheme("paperback")}
                    className={cn(
                        "group flex items-center gap-4 p-3 rounded-xl border transition-all text-left",
                        theme === "paperback"
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:bg-muted"
                    )}
                >
                    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center shrink-0">
                        <Monitor className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <div>
                        <span className="block font-medium text-sm">System</span>
                        <span className="text-xs text-muted-foreground">Auto-detect</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
