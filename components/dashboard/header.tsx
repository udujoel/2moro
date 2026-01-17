"use client";

import { motion } from "framer-motion";

interface DashboardHeaderProps {
    greeting: string;
    message: string;
}

import { AudioAgent } from "@/components/dashboard/audio-agent";

// ... imports

export function DashboardHeader({ greeting, message }: DashboardHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-primary/80 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8 flex items-center justify-between">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl opacity-50" />

            <div className="relative z-10 max-w-2xl">
                {/* ... text */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold mb-2"
                >
                    {greeting}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-white/90 text-lg font-light leading-relaxed"
                >
                    {message}
                </motion.p>
            </div>

            {/* Mic Button positioned to the right */}
            <div className="relative z-20 shrink-0 ml-4">
                <AudioAgent minimal={true} />
            </div>

            {/* Illustration removed - was causing visual artifacts */}
        </div>
    );
}
