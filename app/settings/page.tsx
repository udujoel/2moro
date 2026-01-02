"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();

    const handleResetOnboarding = () => {
        // Clear onboarding persistence
        localStorage.removeItem("onboardingCompleted");
        // Redirect to onboarding
        router.push("/onboarding");
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

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

                <main className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">Manage your preferences and app data.</p>
                    </div>

                    <div className="grid gap-6">
                        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Onboarding & Data</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Want to restart the journey? This will reset your progress indicators, but keeps your data.
                            </p>

                            <button
                                onClick={handleResetOnboarding}
                                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-lg font-medium transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Redo Onboarding
                            </button>
                        </div>

                        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm opacity-50 pointer-events-none">
                            <h2 className="text-xl font-semibold mb-4">Account</h2>
                            <p className="text-sm text-muted-foreground">
                                Account management is coming soon.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
