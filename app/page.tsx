"use client";

import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { setTheme, theme } = useTheme();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center max-w-2xl"
      >
        {/* Logo Mark */}
        <div className="relative mb-8 h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-primary/20 bg-background shadow-2xl">
            {/* Abstract Möbius Strip Representation */}
            <div className={`w-12 h-12 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rotate-45 opacity-80`} />
            <div className="absolute">
              <Play className="h-6 w-6 text-primary fill-current ml-1" />
            </div>
          </div>
        </div>

        {/* Brand Identity */}
        <h1 className="mb-2 text-6xl font-bold tracking-tighter sm:text-7xl">
          2moro
        </h1>
        <p className="mb-12 text-xl font-light text-muted-foreground tracking-wide">
          Craft Your Story. Design Your Future.
        </p>

        {/* Theme Switcher (Demo) */}
        <div className="grid grid-cols-3 gap-4 mb-16 w-full max-w-md">
          <button
            onClick={() => setTheme("daybreak")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:scale-105 ${theme === "daybreak"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-gray-200 dark:border-gray-800 bg-background hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
          >
            <div className="h-4 w-4 rounded-full bg-[#f59e0b]" />
            <span className="text-xs font-medium">Daybreak</span>
          </button>
          <button
            onClick={() => setTheme("midnight")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:scale-105 ${theme === "midnight"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-gray-200 dark:border-gray-800 bg-background hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
          >
            <div className="h-4 w-4 rounded-full bg-[#2dd4bf]" />
            <span className="text-xs font-medium">Midnight</span>
          </button>
          <button
            onClick={() => setTheme("paperback")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:scale-105 ${theme === "paperback"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-gray-200 dark:border-gray-800 bg-background hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
          >
            <div className="h-4 w-4 rounded-full bg-[#d97706]" />
            <span className="text-xs font-medium">Paperback</span>
          </button>
        </div>

        {/* Call to Action */}
        <Link href="/onboarding">
          <button className="group relative overflow-hidden rounded-full bg-foreground px-8 py-3 text-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer">
            <span className="relative z-10 flex items-center gap-2 font-medium">
              Begin Journey <Play className="h-4 w-4 fill-current" />
            </span>
            <div className="absolute inset-0 -translate-x-full bg-primary transition-transform duration-500 group-hover:translate-x-0" />
          </button>
        </Link>
      </motion.div>
    </main>
  );
}
