"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedOrbProps {
    size?: "sm" | "md" | "lg" | "xl";
    state?: "idle" | "listening" | "speaking";
    className?: string;
}

const sizeMap = {
    sm: { container: "w-20 h-20", glow: "blur-2xl" },
    md: { container: "w-28 h-28", glow: "blur-2xl" },
    lg: { container: "w-40 h-40", glow: "blur-3xl" },
    xl: { container: "w-52 h-52", glow: "blur-3xl" },
};

export function AnimatedOrb({
    size = "lg",
    state = "idle",
    className
}: AnimatedOrbProps) {
    const { container, glow } = sizeMap[size];

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Base glow - always present */}
            <div
                className={cn(
                    "absolute rounded-full opacity-40",
                    container,
                    glow,
                    "scale-150",
                    "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600"
                )}
                style={{
                    animation: state === "listening"
                        ? "pulse 1.5s ease-in-out infinite"
                        : "pulse 4s ease-in-out infinite"
                }}
            />

            {/* Secondary glow layer */}
            <motion.div
                className={cn(
                    "absolute rounded-full opacity-25",
                    container,
                    glow,
                    "scale-125"
                )}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    background: "linear-gradient(135deg, rgba(236,72,153,0.6), rgba(6,182,212,0.6))"
                }}
            />

            {/* Main orb sphere */}
            <motion.div
                className={cn(
                    "relative rounded-full overflow-hidden shadow-2xl",
                    container
                )}
                animate={
                    state === "speaking"
                        ? { scale: [1, 1.04, 1] }
                        : state === "listening"
                            ? { scale: [1, 1.02, 1] }
                            : { scale: 1 }
                }
                transition={{
                    duration: state === "speaking" ? 0.6 : 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Base gradient - matches reference (cyan to pink) */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(160deg, #0ea5e9 0%, #8b5cf6 40%, #ec4899 100%)"
                    }}
                />

                {/* Rotating highlight for depth */}
                <motion.div
                    className="absolute inset-0 opacity-50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.2) 15%, transparent 30%)"
                    }}
                />

                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "reverse"
                    }}
                    style={{
                        background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                        backgroundSize: "200% 200%"
                    }}
                />

                {/* Top highlight for 3D effect */}
                <div
                    className="absolute inset-3 rounded-full"
                    style={{
                        background: "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(255,255,255,0.25), transparent 60%)"
                    }}
                />

                {/* Inner core glow */}
                <motion.div
                    className="absolute inset-0"
                    animate={state !== "idle" ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4), transparent 50%)"
                    }}
                />

                {/* Distortion / refraction effect */}
                <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{
                        background: `
                            radial-gradient(ellipse 50% 80% at 30% 30%, rgba(147, 197, 253, 0.5), transparent 50%),
                            radial-gradient(ellipse 60% 50% at 70% 70%, rgba(196, 181, 253, 0.4), transparent 50%)
                        `
                    }}
                />
            </motion.div>

            {/* Particle effects for listening state */}
            {state === "listening" && (
                <>
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
                            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [0, 1, 0.5],
                                x: [0, (Math.cos((i / 6) * Math.PI * 2) * 80)],
                                y: [0, (Math.sin((i / 6) * Math.PI * 2) * 80)]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.25,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </>
            )}

            {/* Expanding rings for speaking state */}
            {state === "speaking" && (
                <>
                    {[1, 2, 3].map((ring) => (
                        <motion.div
                            key={ring}
                            className={cn(
                                "absolute rounded-full border border-cyan-400/20",
                                container
                            )}
                            initial={{ scale: 1, opacity: 0.4 }}
                            animate={{ scale: [1, 1.3 + ring * 0.15], opacity: [0.3, 0] }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: ring * 0.35,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    );
}
