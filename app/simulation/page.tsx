"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { SocraticChat } from "@/components/simulation/socratic-chat";
import { LifeSlideshow } from "@/components/simulation/life-slideshow";
import { useState } from "react";
import { Play } from "lucide-react";
import Link from "next/link";

export default function SimulationPage() {
    const [activeTab, setActiveTab] = useState<"chat" | "slides">("slides");

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex w-64 border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-lg">
                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="w-3 h-3 fill-primary text-primary" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Hello, Architect</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20" />
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
                    <div>
                        <h1 className="text-3xl font-bold">The Oracle</h1>
                        <p className="text-muted-foreground">Consult your future self.</p>
                    </div>

                    <div className="flex gap-4 border-b border-border">
                        <button
                            onClick={() => setActiveTab("slides")}
                            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${activeTab === "slides" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Life Simulation
                            {activeTab === "slides" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${activeTab === "chat" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Socratic Elder
                            {activeTab === "chat" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm">
                        {activeTab === "slides" ? <LifeSlideshow /> : <SocraticChat />}
                    </div>
                </main>
            </div>
        </div>
    );
}
