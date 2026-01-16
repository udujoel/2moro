"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trash2, Loader2, Calendar, CalendarPlus, Settings } from "lucide-react";
import { getTodosByTimeframe, updateTodoStatus, deleteTodo, addTodoToCalendar, isCalendarConnected, addMultipleTodosToCalendar } from "@/app/actions/compass";
import Link from "next/link";
import { useToast } from "@/components/ui/toast-context";

interface Todo {
    id: string;
    task: string;
    description: string | null;
    category: string;
    status: string;
    googleEventId: string | null;
}

interface TodoSectionsProps {
    refreshTrigger?: number;
}

const TIMEFRAMES = [
    { key: "today", label: "Today", emoji: "🎯" },
    { key: "week", label: "This Week", emoji: "📅" },
    { key: "month", label: "This Month", emoji: "🗓️" },
];

export function TodoSections({ refreshTrigger }: TodoSectionsProps) {
    const { showToast } = useToast();
    const [todos, setTodos] = useState<Record<string, Todo[]>>({
        today: [],
        week: [],
        month: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
    const [addingToCalendarIds, setAddingToCalendarIds] = useState<Set<string>>(new Set());
    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [calendarConnected, setCalendarConnected] = useState(false);

    useEffect(() => {
        loadTodos();
        checkCalendarConnection();
    }, [refreshTrigger]);

    const loadTodos = async () => {
        setIsLoading(true);

        const results = await Promise.all(
            TIMEFRAMES.map(async (tf) => {
                const result = await getTodosByTimeframe(tf.key);
                return { timeframe: tf.key, todos: result.todos || [] };
            })
        );

        const todosMap = results.reduce((acc, { timeframe, todos }) => {
            acc[timeframe] = todos;
            return acc;
        }, {} as Record<string, Todo[]>);

        setTodos(todosMap);
        setIsLoading(false);
    };

    const checkCalendarConnection = async () => {
        const result = await isCalendarConnected();
        setCalendarConnected(result.isConnected);
    };

    const handleComplete = async (todoId: string, timeframe: string) => {
        setCompletingIds((prev) => new Set(prev).add(todoId));

        const result = await updateTodoStatus(todoId, "completed");

        if (result.success) {
            setTodos((prev) => ({
                ...prev,
                [timeframe]: prev[timeframe].filter((t) => t.id !== todoId),
            }));
        }

        setCompletingIds((prev) => {
            const next = new Set(prev);
            next.delete(todoId);
            return next;
        });
    };

    const handleDelete = async (todoId: string, timeframe: string) => {
        const result = await deleteTodo(todoId);

        if (result.success) {
            setTodos((prev) => ({
                ...prev,
                [timeframe]: prev[timeframe].filter((t) => t.id !== todoId),
            }));
        }
    };

    const handleAddToCalendar = async (todoId: string, timeframe: string) => {
        setAddingToCalendarIds((prev) => new Set(prev).add(todoId));

        const result = await addTodoToCalendar(todoId);

        if (result.success) {
            // Update the todo to show it's synced
            setTodos((prev) => ({
                ...prev,
                [timeframe]: prev[timeframe].map((t) =>
                    t.id === todoId ? { ...t, googleEventId: result.eventId || 'synced' } : t
                ),
            }));
            showToast("Added to calendar successfully", "success");
        } else {
            showToast(result.error || "Failed to add to calendar", "error");
        }

        setAddingToCalendarIds((prev) => {
            const next = new Set(prev);
            next.delete(todoId);
            return next;
        });
    };

    const handleSyncAll = async () => {
        const pendingSyncIds = Object.values(todos)
            .flat()
            .filter((t) => !t.googleEventId)
            .map((t) => t.id);

        if (pendingSyncIds.length === 0) return;

        setIsSyncingAll(true);
        const result = await addMultipleTodosToCalendar(pendingSyncIds);

        if (result.success) {
            // Update all todos to show as synced
            setTodos((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((tf) => {
                    next[tf] = next[tf].map((t) =>
                        pendingSyncIds.includes(t.id) ? { ...t, googleEventId: 'synced-batch' } : t
                    );
                });
                return next;
                return next;
            });
            showToast(result.message || "All tasks synced to calendar", "success");
        } else {
            showToast(result.message || "Failed to sync all tasks", "error");
        }
        setIsSyncingAll(false);
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalTodos = Object.values(todos).reduce((sum, arr) => sum + arr.length, 0);

    if (totalTodos === 0) {
        return (
            <div className="bg-secondary/30 rounded-xl p-8 text-center">
                <p className="text-muted-foreground">
                    No tasks yet. Accept recommendations above to get started! ✨
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Action Plan Header with Batch Sync */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-muted-foreground/70 uppercase tracking-wider text-xs">
                    Tasks ({totalTodos})
                </h3>
                {calendarConnected && totalTodos > 0 && (
                    <button
                        onClick={handleSyncAll}
                        disabled={isSyncingAll}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isSyncingAll ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <CalendarPlus className="w-3.5 h-3.5" />
                                Add all to Calendar
                            </>
                        )}
                    </button>
                )}
            </div>
            {/* Calendar sync reminder */}
            {!calendarConnected && totalTodos > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-500">
                            Connect Google Calendar to sync your tasks
                        </span>
                    </div>
                    <Link
                        href="/settings"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                    </Link>
                </div>
            )}

            {TIMEFRAMES.map((tf) => {
                const timeframeTodos = todos[tf.key] || [];

                if (timeframeTodos.length === 0) return null;

                return (
                    <div key={tf.key}>
                        <h3 className="font-semibold text-lg mb-3">
                            {tf.emoji} {tf.label}
                        </h3>

                        <div className="space-y-2">
                            {timeframeTodos.map((todo) => {
                                const isCompleting = completingIds.has(todo.id);
                                const isAddingToCalendar = addingToCalendarIds.has(todo.id);
                                const isSyncedToCalendar = !!todo.googleEventId;

                                return (
                                    <motion.div
                                        key={todo.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 group hover:border-primary/30 transition-colors"
                                    >
                                        <button
                                            onClick={() => handleComplete(todo.id, tf.key)}
                                            disabled={isCompleting}
                                            className="mt-0.5 p-1 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
                                        >
                                            {isCompleting ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            ) : (
                                                <div className="w-5 h-5 rounded border-2 border-muted-foreground group-hover:border-primary transition-colors" />
                                            )}
                                        </button>

                                        <div className="flex-1">
                                            <p className="font-medium mb-1">{todo.task}</p>
                                            {todo.description && (
                                                <p className="text-sm text-muted-foreground">{todo.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                                                    {todo.category}
                                                </span>
                                                {isSyncedToCalendar && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Synced
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Add to Calendar button */}
                                            {calendarConnected && !isSyncedToCalendar && (
                                                <button
                                                    onClick={() => handleAddToCalendar(todo.id, tf.key)}
                                                    disabled={isAddingToCalendar}
                                                    className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-all disabled:opacity-50"
                                                    title="Add to Calendar"
                                                >
                                                    {isAddingToCalendar ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CalendarPlus className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(todo.id, tf.key)}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
