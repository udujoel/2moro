"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Palette, Moon, Sun, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeSwitcherFAB() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: "daybreak", icon: Sun, label: "Daybreak", color: "bg-orange-400" },
        { id: "midnight", icon: Moon, label: "Midnight", color: "bg-teal-400" },
        { id: "paperback", icon: Book, label: "Paperback", color: "bg-amber-600" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-3 mb-2"
                    >
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id as any);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 bg-card border border-border p-2 pr-4 rounded-full shadow-lg hover:bg-muted transition-all group"
                            >
                                <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-white shadow-sm`}>
                                    <t.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{t.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl 
                    flex items-center justify-center transition-transform hover:scale-105 active:scale-95
                    ${isOpen ? "rotate-90" : "rotate-0"}
                `}
            >
                <Palette className="w-6 h-6" />
            </button>
        </div>
    );
}
