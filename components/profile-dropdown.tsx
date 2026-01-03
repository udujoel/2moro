// ... imports ...
import { useUser } from "@/components/user-provider";
import { Settings, LogOut, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export function ProfileDropdown() {
    const { user, profileImage, logout, resetOnboarding } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fallback if no user (should normally be redirected, but safe guard)
    if (!user && !profileImage) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-muted/50 transition-colors"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">{user?.name || "Traveler"}</p>
                    <p className="text-xs text-muted-foreground">{user?.title || "Level 1"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden border-2 border-background shadow-sm">
                    {profileImage || user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImage || user?.avatar || ""} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary">
                            <span className="text-lg font-bold">{user?.name?.[0] || <User className="w-5 h-5" />}</span>
                        </div>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-3xl shadow-xl overflow-hidden z-50 p-2"
                    >
                        <div className="px-4 py-3 border-b border-border/50 mb-2">
                            <p className="font-semibold text-sm">Signed in as</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email || "guest@2moro.app"}</p>
                        </div>

                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-xl hover:bg-muted transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>

                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
