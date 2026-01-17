"use client";

import { LocationToggle } from "@/components/settings/location-toggle";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export function PrivacySection({ user }: { user: any }) {
    const locationEnabled = user?.preferences?.locationEnabled ?? user?.userPreferences?.locationEnabled ?? false;

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold">Privacy & Data</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your data permissions.</p>
                </div>

                <div className="space-y-4">
                    <LocationToggle
                        userId={user.id}
                        initialEnabled={locationEnabled}
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-red-500">Log Out</h2>
                        <p className="text-sm text-muted-foreground mt-1">Sign out of your account on this device.</p>
                    </div>

                    <form action={async () => {
                        // This needs to be a server action import or handled differently if this component is client-side
                        // Since we are in a client component, we might need a button that calls a server action passed via props, 
                        // OR allow this valid server action call pattern if configured correctly.
                        // For simplicity in this refactor, we'll keep the direct action pattern if supported, 
                        // or standard client-side fetch if preferred. 
                        // Note: importing server actions in client components IS supported in Next.js 14+
                        window.location.href = "/api/auth/signout"; // Fallback simple logout
                    }}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2 rounded-lg transition-colors border border-red-200 dark:border-red-900"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
