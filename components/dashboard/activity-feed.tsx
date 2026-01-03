"use client";

import { CheckCircle2, Circle, Clock, FileText } from "lucide-react";

interface ActivityFeedProps {
    habits: {
        id: string;
        title: string;
        streak: number;
        completedToday: boolean;
    }[];
    recentMemories: {
        id: string;
        type: string;
        preview: string;
        time: string;
        date: string;
    }[];
}

export function ActivityFeed({ habits, recentMemories }: ActivityFeedProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4">Breakdown</h3>

            <div className="space-y-6 overflow-y-auto pr-2">
                {/* Habits Section */}
                <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Daily Habits</h4>
                    {habits.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No habits set.</p>
                    ) : (
                        habits.map(habit => (
                            <div key={habit.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <button className={`transition-colors ${habit.completedToday ? "text-green-500" : "text-muted-foreground hover:text-primary"}`}>
                                        {habit.completedToday ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <span className={habit.completedToday ? "text-muted-foreground line-through" : "text-foreground"}>
                                        {habit.title}
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-bg-primary/20 bg-secondary px-2 py-1 rounded">
                                    🔥 {habit.streak}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent Entries Log */}
                <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Activity Log</h4>
                    {recentMemories.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No recent activity.</p>
                    ) : (
                        recentMemories.map(memory => (
                            <div key={memory.id} className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl hover:bg-secondary/20 transition-colors">
                                <div className="mt-1">
                                    {memory.type === 'image' ? <FileText className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-purple-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate font-medium">{memory.preview}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{memory.time}</span>
                                        <span>•</span>
                                        <span>{memory.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
