import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-8 h-8", className)}
            {...props}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 equivalent */}
                </linearGradient>
            </defs>
            {/* Abstract forward shape representing '2' and 'Forward' */}
            <path
                d="M6 8C6 5.79086 7.79086 4 10 4H18C20.2091 4 22 5.79086 22 8C22 10.2091 20.2091 12 18 12H12L22 24V28H6V24H16L6 12V8Z"
                fill="url(#logo-gradient)"
                className="text-primary"
            />
            {/* Arrow accent */}
            <path
                d="M24 16L28 20L24 24"
                stroke="url(#logo-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
