"use client";

import { Shield, Key, Smartphone, Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { changePassword } from "@/app/actions/user";

export function SecuritySection({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePasswordUpdate = async () => {
        setIsLoading(true);
        setMessage("");
        try {
            const res = await changePassword();
            if (res.success) {
                setMessage("Reset link sent!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold">Security</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your password and security settings.</p>
                </div>

                <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-sm">Change Password</div>
                                <div className="text-xs text-muted-foreground">Last changed 3 months ago</div>
                            </div>
                        </div>
                        <button
                            onClick={handlePasswordUpdate}
                            disabled={isLoading}
                            className="px-3 py-1 text-xs font-medium border border-border rounded-md bg-background group-hover:bg-muted transition-colors min-w-[70px] flex justify-center"
                        >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (message || "Update")}
                        </button>
                    </div>

                    <button className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-sm">Two-Factor Authentication</div>
                                <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                            </div>
                        </div>
                        <div className="px-3 py-1 text-xs font-medium border border-border rounded-md bg-background text-red-500 group-hover:bg-muted transition-colors">
                            Disabled
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-medium text-sm">Active Sessions</h3>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-sm font-medium">Mac OS - Chrome</div>
                        <div className="text-xs text-muted-foreground">Anchorage, US • Current Session</div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
            </div>
        </div>
    );
}
