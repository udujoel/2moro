"use client";

import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DevLoginButton } from "@/components/auth/dev-login-button";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    // Show loading while checking auth status
    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-semibold">Loading...</div>
            </div>
        );
    }

    // Login Page Layout
    return (
        <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
            {/* Left Column - Auth Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24 xl:px-32 relative z-10">
                {/* Logo - Top Left */}
                <div className="absolute top-8 left-8 lg:left-12 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Logo className="h-5 w-5 fill-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">2moro</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto w-full max-w-sm space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Logo className="h-8 w-8 text-primary-foreground fill-current" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground text-sm">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {/* Login Options */}
                    <div className="space-y-4">
                        {/* 1. Dev Login (First Option) */}
                        <div className="relative">
                            <DevLoginButton />
                        </div>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        {/* 2. Google Login (Second Option) */}
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-background/50 px-4 py-3 font-medium transition-all hover:bg-accent hover:text-accent-foreground group"
                        >
                            <Chrome className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    {/* Footer Links */}
                    <p className="text-center text-xs text-muted-foreground pt-4">
                        Don&apos;t have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Register
                        </Link>
                    </p>

                    <div className="text-center text-[10px] text-muted-foreground/60">
                        By clickin continue, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
                    </div>
                </motion.div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="hidden w-1/2 lg:block relative bg-muted">
                {/* Image */}
                <Image
                    src="/images/login-hero.png"
                    alt="Lifestyle background"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Overlay Gradient for text readability if needed, or just style */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 mix-blend-multiply" />

                {/* Quote or decorative element (Optional) */}
                <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium italic">&quot;The future belongs to those who prepare for it today.&quot;</p>
                        <footer className="text-sm text-white/80">— The 2moro Philosophy</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
