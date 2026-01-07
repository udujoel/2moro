"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { BookTheme } from "./book-viewer";

interface BookSettingsProps {
    theme: BookTheme;
    onThemeChange: (theme: BookTheme) => void;
}

export function BookSettings({ theme, onThemeChange }: BookSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const themes: Array<{ id: BookTheme; label: string; description: string }> = [
        { id: "classic", label: "Classic", description: "Serif font, cream background" },
        { id: "modern", label: "Modern", description: "Sans-serif, clean white" },
        { id: "dark", label: "Dark", description: "Dark theme for night reading" },
        { id: "vintage", label: "Vintage", description: "Aged paper aesthetic" }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Book settings"
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-sm">Book Theme</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        onThemeChange(t.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${theme === t.id
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <div className="font-medium text-sm">{t.label}</div>
                                    <div className="text-xs opacity-70">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
