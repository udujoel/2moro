"use client";

import { useState } from "react";
import { Check, Circle, Plus } from "lucide-react";

interface Habit {
    id: number;
    title: string;
    completed: boolean;
    streak: number;
}

export function HabitStack() {
    const [habits, setHabits] = useState<Habit[]>([
        { id: 1, title: "Review expenses for 2 mins", completed: false, streak: 12 },
        { id: 2, title: "Read 10 pages", completed: true, streak: 5 },
        { id: 3, title: "Drink 2L water", completed: false, streak: 0 },
    ]);

    const toggleHabit = (id: number) => {
        setHabits(habits.map(h =>
            h.id === id ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak - 1 } : h
        ));
    };

    return (
        <div className="flex flex-col gap-3">
            {habits.map((habit) => (
                <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`group flex items-center justify-between p-4 rounded-xl border border-border cursor-pointer transition-all ${habit.completed
                            ? "bg-primary/10 border-primary/20"
                            : "bg-card hover:border-primary/50"
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${habit.completed
                                ? "bg-primary border-primary"
                                : "border-muted-foreground group-hover:border-primary"
                            }`}>
                            {habit.completed && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                        <span className={`font-medium transition-all ${habit.completed ? "text-muted-foreground line-through" : ""}`}>
                            {habit.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <span className="text-primary">{habit.streak}</span>
                        <span>streak</span>
                    </div>
                </div>
            ))}

            <button className="flex items-center justify-center text-sm text-primary font-medium p-3 hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-primary/30">
                <Plus className="w-4 h-4 mr-2" />
                Add Atomic Habit
            </button>
        </div>
    );
}
