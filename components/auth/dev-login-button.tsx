"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

/**
 * Development-only button for quick login as the default user.
 * This component is completely hidden in production builds.
 */
export function DevLoginButton() {
    const [isLoading, setIsLoading] = useState(false);

    // Only render in development mode
    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    const handleDevLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("dev-login", {
                email: "tim@2moro.app",
                callbackUrl: "/dashboard",
            });
        } catch (error) {
            console.error("Dev login failed:", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDevLogin}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-300 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {isLoading ? (
                <>
                    <span className="animate-spin">⏳</span>
                    Logging in...
                </>
            ) : (
                <>
                    🚀 Login as Default User
                    <span className="text-xs opacity-60">(Dev Only)</span>
                </>
            )}
        </button>
    );
}
