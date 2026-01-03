"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { createHabit, deleteHabit, toggleHabit } from "@/app/actions/habits";

interface Habit {
    id: string;
    title: string;
    streak: number;
    lastCompletedAt: Date | null;
}

interface HabitStackProps {
    initialHabits: Habit[];
    userId: string;
}

export function HabitStack({ initialHabits, userId }: HabitStackProps) {
    const [isPending, startTransition] = useTransition();
    // Optimistic state: [habits list, pending operation]
    const [optimisticHabits, addOptimisticHabit] = useOptimistic(
        initialHabits,
        (state, { action, habitId, newHabit }: { action: 'toggle' | 'add' | 'delete', habitId?: string, newHabit?: Habit }) => {
            if (action === 'toggle') {
                return state.map(h => {
                    if (h.id === habitId) {
                        const isCompletedToday = h.lastCompletedAt && new Date(h.lastCompletedAt).toDateString() === new Date().toDateString();
                        return {
                            ...h,
                            streak: isCompletedToday ? Math.max(0, h.streak - 1) : h.streak + 1,
                            lastCompletedAt: isCompletedToday ? null : new Date(),
                        };
                    }
                    return h;
                });
            } else if (action === 'add' && newHabit) {
                return [...state, newHabit];
            } else if (action === 'delete') {
                return state.filter(h => h.id !== habitId);
            }
            return state;
        }
    );

    const [newHabitTitle, setNewHabitTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleToggle = (id: string, lastCompletedAt: Date | null) => {
        const isCompletedToday = lastCompletedAt && new Date(lastCompletedAt).toDateString() === new Date().toDateString();
        // Optimistic update
        startTransition(async () => {
            addOptimisticHabit({ action: 'toggle', habitId: id });
            await toggleHabit(id, !isCompletedToday);
        });
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        const tempId = Math.random().toString();
        const newHabit: Habit = {
            id: tempId,
            title: newHabitTitle,
            streak: 0,
            lastCompletedAt: null
        };

        setIsAdding(false);
        setNewHabitTitle("");

        startTransition(async () => {
            addOptimisticHabit({ action: 'add', newHabit });
            await createHabit(userId, newHabit.title);
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            addOptimisticHabit({ action: 'delete', habitId: id });
            await deleteHabit(id);
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {optimisticHabits.map((habit) => {
                const isCompletedToday = habit.lastCompletedAt && new Date(habit.lastCompletedAt).toDateString() === new Date().toDateString();

                return (
                    <div
                        key={habit.id}
                        className={`group flex items-center justify-between p-4 rounded-xl border border-border cursor-pointer transition-all ${isCompletedToday
                            ? "bg-primary/10 border-primary/20"
                            : "bg-card hover:border-primary/50"
                            }`}
                    >
                        {/* Click area for toggle */}
                        <div
                            className="flex-1 flex items-center gap-4"
                            onClick={() => handleToggle(habit.id, habit.lastCompletedAt)}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompletedToday
                                ? "bg-primary border-primary"
                                : "border-muted-foreground group-hover:border-primary"
                                }`}>
                                {isCompletedToday && <Check className="w-4 h-4 text-primary-foreground" />}
                            </div>
                            <span className={`font-medium transition-all ${isCompletedToday ? "text-muted-foreground line-through" : ""}`}>
                                {habit.title}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <span className="text-primary">{habit.streak}</span>
                                <span>streak</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(habit.id); }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })}

            {isAdding ? (
                <form onSubmit={handleAddHabit} className="p-4 rounded-xl border border-dashed border-primary/30 bg-card">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Habit name..."
                        className="w-full bg-transparent outline-none text-sm"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        onBlur={() => !newHabitTitle && setIsAdding(false)}
                    />
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center text-sm text-primary font-medium p-3 hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-primary/30"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Atomic Habit
                </button>
            )}
        </div>
    );
}
