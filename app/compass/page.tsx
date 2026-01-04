"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/top-bar";
import { motion } from "framer-motion";
import { Book, Compass, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-provider";

export default function CompassPage() {
    const { user } = useUser();

    const modules = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "bg-blue-500", desc: "Your daily overview" },
        { label: "Oracle", href: "/simulation", icon: Sparkles, color: "bg-purple-500", desc: "Explore futures" },
        { label: "Diary", href: "/archive", icon: Book, color: "bg-pink-500", desc: "Past memories" },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            <Sidebar className="hidden md:flex shrink-0 z-30" />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-muted/10">
                <TopBar title="The Compass" />

                <main className="flex-1 p-6 md:p-8 flex items-center justify-center relative overflow-hidden">
                    {/* Background Ambience */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[100px] rounded-full opacity-50 animate-pulse" />
                    </div>

                    <div className="relative z-10 max-w-4xl w-full">
                        <div className="text-center mb-12">
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-4xl md:text-5xl font-bold mb-4"
                            >
                                Where to next, {user?.name?.split(' ')[0] || "Traveler"}?
                            </motion.h1>
                            <p className="text-muted-foreground text-lg">Navigate your life system.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {modules.map((mod, idx) => (
                                <Link key={mod.href} href={mod.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-card border border-border p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all h-full group flex flex-col items-center text-center backdrop-blur-sm"
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${mod.color} shadow-inner`}>
                                            <mod.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{mod.label}</h3>
                                        <p className="text-muted-foreground">{mod.desc}</p>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
