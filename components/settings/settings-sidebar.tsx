"use client";

import { User, Palette, Bell, Shield, Calendar, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const ITEMS = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Calendar },
    { id: "privacy", label: "Privacy & Data", icon: Globe },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
    return (
        <div className="w-full lg:w-64 flex flex-col gap-2">
            {ITEMS.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left",
                        activeTab === item.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                </button>
            ))}
        </div>
    );
}
