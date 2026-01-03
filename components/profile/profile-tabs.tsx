"use client";

import { User, Settings, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    const tabs = [
        { id: "personal", label: "Personal Information", icon: User },
        { id: "integration", label: "Integration Preferences", icon: Settings },
        { id: "notifications", label: "Notification Settings", icon: Bell },
        { id: "security", label: "Security Settings", icon: Shield },
    ];

    return (
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border w-full lg:w-72 flex flex-col gap-2 h-fit">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium relative overflow-hidden group w-full text-left",
                            isActive
                                ? "text-white bg-primary shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4 relative z-10", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
