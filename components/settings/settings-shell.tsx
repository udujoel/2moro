"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SettingsSidebar } from "./settings-sidebar";
import { User } from "@prisma/client";

// Sections
import { ProfileSection } from "./sections/profile-section";
import { AppearanceSection } from "./sections/appearance-section";
import { NotificationSection } from "./sections/notification-section";
import { SecuritySection } from "./sections/security-section";
import { IntegrationsSection } from "./sections/integrations-section"; // Renaming CalendarIntegration to fit pattern
import { PrivacySection } from "./sections/privacy-section"; // Renaming LocationToggle to fit pattern

interface SettingsShellProps {
    user: User & { userPreferences: any };
}

export function SettingsShell({ user }: SettingsShellProps) {
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "personal" && <ProfileSection user={user} />}
                        {activeTab === "appearance" && <AppearanceSection />}
                        {activeTab === "notifications" && <NotificationSection user={user} />}
                        {activeTab === "security" && <SecuritySection user={user} />}
                        {/* We'll pass specific props to these based on previous page implementation */}
                        {activeTab === "integrations" && <IntegrationsSection user={user} />}
                        {activeTab === "privacy" && <PrivacySection user={user} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
