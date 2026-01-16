"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

interface LogoProps {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 20 }: LogoProps) {
    const { theme } = useTheme();

    // Use white logo for dark themes, black logo for light themes
    const isDarkTheme = theme === "midnight";
    const logoSrc = isDarkTheme ? "/logo-light.png" : "/logo-dark.png";

    return (
        <Image
            src={logoSrc}
            alt="2moro Logo"
            width={size}
            height={size}
            className={className}
            style={{ objectFit: "contain" }}
        />
    );
}
