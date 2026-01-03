"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/components/user-provider";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login, user } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter(); // Import needed

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login - just uses the email name part as the name
        const name = email.split("@")[0] || "User";
        // Capitalize first letter
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

        login(formattedName, email);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">2moro</h1>
                    <p className="text-muted-foreground">Sign in to continue your journey.</p>
                </div>

                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                // Password not actually checked in mock
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            Sign In <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            New here?{" "}
                            <Link href="/onboarding" className="text-primary hover:underline font-medium">
                                Start your journey
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
