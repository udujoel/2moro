"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeCustomizer() {
    const { setTheme, theme } = useTheme();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button
                onClick={() => setTheme("daybreak")}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105 ${theme === "daybreak"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                    }`}
            >
                <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-white to-orange-50 border border-border shadow-sm flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#f59e0b] shadow-lg" />
                </div>
                <div className="text-center">
                    <span className="block text-sm font-semibold">Daybreak</span>
                    <span className="text-xs text-muted-foreground">Clean, bright, energetic</span>
                </div>
            </button>

            <button
                onClick={() => setTheme("midnight")}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105 ${theme === "midnight"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                    }`}
            >
                <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-border shadow-sm flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#2dd4bf] shadow-lg shadow-teal-500/20" />
                </div>
                <div className="text-center">
                    <span className="block text-sm font-semibold">Midnight</span>
                    <span className="text-xs text-muted-foreground">Deep, focused, elegant</span>
                </div>
            </button>

            <button
                onClick={() => setTheme("paperback")}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105 ${theme === "paperback"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-background hover:bg-muted"
                    }`}
            >
                <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 border border-border shadow-sm flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#d97706] shadow-lg" />
                </div>
                <div className="text-center">
                    <span className="block text-sm font-semibold">Paperback</span>
                    <span className="text-xs text-muted-foreground">Warm, comfortable, classic</span>
                </div>
            </button>
        </div>
    );
}
