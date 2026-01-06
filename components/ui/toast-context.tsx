"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                                pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md min-w-[300px]
                                ${toast.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-600" : ""}
                                ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-600" : ""}
                                ${toast.type === "info" ? "bg-blue-500/10 border-blue-500/20 text-blue-600" : ""}
                                bg-card
                            `}
                        >
                            <div className={`p-1 rounded-full 
                                ${toast.type === "success" ? "bg-green-500/20" : ""}
                                ${toast.type === "error" ? "bg-red-500/20" : ""}
                                ${toast.type === "info" ? "bg-blue-500/20" : ""}
                            `}>
                                {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
                                {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
                                {toast.type === "info" && <Info className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-sm text-foreground/90">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
