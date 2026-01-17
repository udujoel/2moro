"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 20 }: LogoProps) {
    const { theme } = useTheme();
    const isDark = theme === "midnight";

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <Image
                src="/logo-correct.png"
                alt="2moro Logo"
                fill
                className={cn(
                    "object-contain transition-all duration-300",
                    isDark && "invert brightness-0" // Invert black to white for dark mode
                )}
                priority
            />
        </div>
    );
}
