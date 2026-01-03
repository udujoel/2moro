"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/top-bar";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { ProfileForm } from "@/components/profile/profile-form";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 font-sans">
            {/* Sidebar (Left) */}
            <Sidebar className="hidden md:flex border-r border-border shrink-0 w-20 lg:w-64" />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <TopBar title="My Account" />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold">My Account</h1>
                            <p className="text-muted-foreground">Manage your personal information and security.</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Left: Tabs */}
                            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                            {/* Right: Content Area */}
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 w-full"
                            >
                                {activeTab === "personal" && <ProfileForm />}
                                {activeTab !== "personal" && (
                                    <div className="bg-card rounded-3xl p-12 text-center border border-border border-dashed">
                                        <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🚧</div>
                                        <h3 className="text-xl font-semibold mb-2">Under Construction</h3>
                                        <p className="text-muted-foreground">The {activeTab} settings are coming soon.</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
