"use client";

import { Book, Calendar, Smartphone, Trophy } from "lucide-react";

interface StatsCardsProps {
    stats: {
        total: number;
        thisYear: number;
        thisMonth: number;
        thisWeek: number;
    }
}

export function StatsCards({ stats }: StatsCardsProps) {
    const items = [
        { label: "Total Memories", value: stats.total, icon: Book, color: "bg-blue-500/10 text-blue-500" },
        { label: "This Year", value: stats.thisYear, icon: Trophy, color: "bg-yellow-500/10 text-yellow-500" },
        { label: "This Month", value: stats.thisMonth, icon: Calendar, color: "bg-pink-500/10 text-pink-500" },
        { label: "This Week", value: stats.thisWeek, icon: Smartphone, color: "bg-purple-500/10 text-purple-500" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
                <div key={idx} className="bg-card rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group border border-border/50">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform shadow-inner`}>
                        <item.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{item.label}</p>
                        <h3 className="text-3xl font-extrabold text-foreground">{item.value.toLocaleString()}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
