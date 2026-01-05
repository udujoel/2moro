"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/components/user-provider";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    );
}
