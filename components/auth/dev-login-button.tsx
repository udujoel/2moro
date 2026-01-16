"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

/**
 * Development-only button for quick login as the default user.
 * This component is completely hidden in production builds.
 */
export function DevLoginButton() {
    const [isLoading, setIsLoading] = useState(false);

    // Environment check removed to allow default login in production as requested
    // if (process.env.NODE_ENV !== "development") {
    //     return null;
    // }

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
            className="w-full px-4 py-3 bg-accent/20 border border-accent/50 rounded-xl text-accent-foreground hover:bg-accent/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
            style={{
                backgroundColor: 'rgba(224, 122, 95, 0.15)',
                borderColor: 'rgba(224, 122, 95, 0.5)',
                color: '#c45a3a'
            }}
        >
            {isLoading ? (
                <>
                    <span className="animate-spin">⏳</span>
                    Logging in...
                </>
            ) : (
                <>
                    🚀 Login as Test User
                </>
            )}
        </button>
    );
}
