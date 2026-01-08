"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { getTodosByTimeframe, updateTodoStatus, deleteTodo } from "@/app/actions/compass";

interface Todo {
    id: string;
    task: string;
    description?: string;
    category: string;
    status: string;
}

interface TodoSectionsProps {
    userId: string;
    refreshTrigger?: number;
}

const TIMEFRAMES = [
    { key: "today", label: "Today", emoji: "🎯" },
    { key: "week", label: "This Week", emoji: "📅" },
    { key: "month", label: "This Month", emoji: "🗓️" },
];

export function TodoSections({ userId, refreshTrigger }: TodoSectionsProps) {
    const [todos, setTodos] = useState<Record<string, Todo[]>>({
        today: [],
        week: [],
        month: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadTodos();
    }, [userId, refreshTrigger]);

    const loadTodos = async () => {
        setIsLoading(true);

        const results = await Promise.all(
            TIMEFRAMES.map(async (tf) => {
                const result = await getTodosByTimeframe(userId, tf.key);
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

    const handleComplete = async (todoId: string, timeframe: string) => {
        setCompletingIds((prev) => new Set(prev).add(todoId));

        const result = await updateTodoStatus(todoId, "completed");

        if (result.success) {
            // Remove from list
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
                                            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-secondary">
                                                {todo.category}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(todo.id, tf.key)}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
