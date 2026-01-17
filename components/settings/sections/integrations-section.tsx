"use client";

import { CalendarIntegration } from "@/components/settings/calendar-integration";
import { Link2 } from "lucide-react";

export function IntegrationsSection({ user }: { user: any }) {
    const isCalendarConnected = user?.userPreferences?.googleCalendarEnabled ?? false;

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Integrations</h2>
                <p className="text-sm text-muted-foreground mt-1">Connect with your favorite tools.</p>
            </div>

            <div className="space-y-6">
                {/* Google Calendar */}
                <div className="space-y-4">
                    <CalendarIntegration
                        userId={user.id}
                        isConnected={isCalendarConnected}
                    />
                </div>

                <div className="border-t border-border" />

                {/* Placeholder for future integrations */}
                <div className="opacity-50 pointer-events-none">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Link2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-sm">Spotify</div>
                                <div className="text-xs text-muted-foreground">Sync your listening habits</div>
                            </div>
                        </div>
                        <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">Coming Soon</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
