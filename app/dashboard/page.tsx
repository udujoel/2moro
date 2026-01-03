"use client";

import { useState } from "react";
import { HabitStack } from "@/components/dashboard/habit-stack";
import { ImpactSlider } from "@/components/dashboard/impact-slider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useTheme } from "@/components/theme-provider";

export default function DashboardPage() {
    const { theme } = useTheme();

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <div className="flex items-center gap-4">
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                    <div>
                        <h1 className="text-3xl font-bold">Compass</h1>
                        <p className="text-muted-foreground">Navigate your daily actions to shape your future.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">Today's Discipline</h2>
                            <ImpactSlider />
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">Atomic Habits</h2>
                            <HabitStack />
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
