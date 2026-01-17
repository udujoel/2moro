"use client";

import { useState } from "react";
import { updateUserPreferences } from "@/app/actions/user";

export function NotificationSection({ user }: { user: any }) {
    // Initialize preferences if available, or default
    const [emailEnabled, setEmailEnabled] = useState(user?.userPreferences?.emailNotifications ?? true);
    const [pushEnabled, setPushEnabled] = useState(user?.userPreferences?.pushNotifications ?? false);
    const [digestEnabled, setDigestEnabled] = useState(user?.userPreferences?.weeklyDigest ?? true);

    const handleToggle = async (key: string, value: boolean, setter: (v: boolean) => void) => {
        setter(value); // Optimistic UI update
        await updateUserPreferences({ [key]: value });
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage how you receive updates and alerts.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                        <div className="font-medium text-sm">Email Notifications</div>
                        <div className="text-xs text-muted-foreground">Receive updates about your account via email.</div>
                    </div>
                    <button
                        onClick={() => handleToggle("emailNotifications", !emailEnabled, setEmailEnabled)}
                        className={`w-11 h-6 flex items-center rounded-full px-1 cursor-pointer transition-colors ${emailEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                        <div className="font-medium text-sm">Push Notifications</div>
                        <div className="text-xs text-muted-foreground">Receive real-time alerts on your device.</div>
                    </div>
                    <button
                        onClick={() => handleToggle("pushNotifications", !pushEnabled, setPushEnabled)}
                        className={`w-11 h-6 flex items-center rounded-full px-1 cursor-pointer transition-colors ${pushEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                        <div className="font-medium text-sm">Weekly Digest</div>
                        <div className="text-xs text-muted-foreground">A summary of your weekly activity and insights.</div>
                    </div>
                    <button
                        onClick={() => handleToggle("weeklyDigest", !digestEnabled, setDigestEnabled)}
                        className={`w-11 h-6 flex items-center rounded-full px-1 cursor-pointer transition-colors ${digestEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digestEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
