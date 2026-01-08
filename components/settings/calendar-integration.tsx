"use client";

import { useState } from "react";
import { Calendar, Check, ExternalLink, Loader2, Unlink } from "lucide-react";

interface CalendarIntegrationProps {
    userId: string;
    isConnected: boolean;
}

export function CalendarIntegration({ userId, isConnected: initialConnected }: CalendarIntegrationProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(initialConnected);

    const handleConnect = () => {
        setIsConnecting(true);
        // Redirect to OAuth flow
        window.location.href = "/api/auth/google/calendar";
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            const response = await fetch("/api/auth/google/disconnect", {
                method: "POST",
            });
            if (response.ok) {
                setIsConnected(false);
            }
        } catch (error) {
            console.error("Failed to disconnect:", error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isConnected ? "bg-green-500/10" : "bg-muted"}`}>
                        <Calendar className={`w-5 h-5 ${isConnected ? "text-green-500" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                        <p className="font-medium">Google Calendar</p>
                        <p className="text-sm text-muted-foreground">
                            {isConnected
                                ? "Connected - tasks can be synced to your calendar"
                                : "Connect to sync your action plan with Google Calendar"}
                        </p>
                    </div>
                </div>

                {isConnected ? (
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-green-500">
                            <Check className="w-4 h-4" />
                            Connected
                        </span>
                        <button
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isDisconnecting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Unlink className="w-4 h-4" />
                            )}
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <ExternalLink className="w-4 h-4" />
                                Connect Google Calendar
                            </>
                        )}
                    </button>
                )}
            </div>

            {isConnected && (
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Your Action Plan tasks can now be added to your Google Calendar.
                        Look for the "Add to Calendar" button in your task list.
                    </p>
                </div>
            )}

            {!isConnected && (
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        Connecting your Google Calendar allows you to:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• Add action plan tasks directly to your calendar</li>
                        <li>• Set reminders for upcoming tasks</li>
                        <li>• Keep your schedule in sync</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
