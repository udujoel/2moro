"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    Compass, BookOpen, Play, Moon, Sun, Book, Sparkles, LayoutDashboard,
    PanelLeft, PanelLeftClose, Settings, LogOut, User, ChevronRight, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-provider";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Compass", icon: Compass, href: "/compass" },
    { label: "Oracle", icon: Sparkles, href: "/simulation" },
    { label: "Diary", icon: Book, href: "/archive" },
];

// Tooltip component for instant hover display
function Tooltip({ children, label, side = "right" }: {
    children: React.ReactNode;
    label: string;
    side?: "right" | "top";
}) {
    return (
        <div className="relative group/tooltip">
            {children}
            <div className={cn(
                "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg",
                "opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible",
                "transition-opacity duration-0 delay-0", // Instant - no delay
                "whitespace-nowrap pointer-events-none",
                side === "right"
                    ? "left-full ml-2 top-1/2 -translate-y-1/2"
                    : "bottom-full mb-2 left-1/2 -translate-x-1/2"
            )}>
                {label}
                {/* Arrow */}
                <div className={cn(
                    "absolute w-2 h-2 bg-gray-900 rotate-45",
                    side === "right"
                        ? "-left-1 top-1/2 -translate-y-1/2"
                        : "-bottom-1 left-1/2 -translate-x-1/2"
                )} />
            </div>
        </div>
    );
}

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);
    const { profileImage, user } = useUser();
    const { theme, setTheme } = useTheme();

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
        // Close menus when collapsing
        if (isExpanded) {
            setShowProfileMenu(false);
            setShowThemeSubmenu(false);
        }
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme as any);
        setShowThemeSubmenu(false);
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        // Navigate to home or implement logout logic
        router.push("/");
    };

    return (
        <aside
            className={cn(
                "flex flex-col py-4 h-screen sticky top-0 ease-in-out border-r border-border bg-card/30 backdrop-blur-xl z-30",
                isExpanded ? "w-48 px-3 transition-all duration-300" : "w-14 px-2 transition-all duration-300",
                className
            )}
        >
            {/* Sidebar Toggle / Logo */}
            <div className="flex items-center mb-6 h-10">
                {isExpanded ? (
                    <>
                        <Link href="/" className="flex items-center gap-3 flex-1 group">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-primary" />
                            </div>
                            <span className="font-bold text-lg whitespace-nowrap">2moro</span>
                        </Link>
                        {/* Collapse button with tooltip when expanded */}
                        <Tooltip label="Close sidebar ⌘." side="right">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                            >
                                <PanelLeftClose className="w-5 h-5" />
                            </button>
                        </Tooltip>
                    </>
                ) : (
                    <Tooltip label="Open sidebar">
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex justify-center p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                        >
                            <PanelLeft className="w-5 h-5" />
                        </button>
                    </Tooltip>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    const NavContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center py-2.5 rounded-xl font-medium transition-all overflow-hidden whitespace-nowrap group",
                                isExpanded ? "px-3 justify-start" : "px-0 justify-center",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 shrink-0 transition-transform duration-150",
                                !isExpanded && "group-hover:scale-110 group-hover:rotate-3"
                            )} />
                            <span
                                className={cn(
                                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                                    isExpanded ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );

                    // Only wrap with tooltip when collapsed
                    return isExpanded ? (
                        <div key={item.href}>{NavContent}</div>
                    ) : (
                        <Tooltip key={item.href} label={item.label}>
                            {NavContent}
                        </Tooltip>
                    );
                })}
            </nav>

            {/* MyStory Quick Link */}
            {isExpanded ? (
                <Link
                    href="/mystory"
                    className={cn(
                        "flex items-center py-2.5 rounded-xl font-medium transition-all overflow-hidden whitespace-nowrap group mb-4",
                        "px-3 justify-start",
                        pathname === "/mystory"
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span className="w-auto opacity-100 ml-3">MyStory</span>
                </Link>
            ) : (
                <Tooltip label="MyStory">
                    <Link
                        href="/mystory"
                        className={cn(
                            "flex items-center py-2.5 rounded-xl font-medium transition-all overflow-hidden whitespace-nowrap group mb-4",
                            "px-0 justify-center",
                            pathname === "/mystory"
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                    >
                        <BookOpen className={cn(
                            "w-5 h-5 shrink-0 transition-transform duration-150",
                            "group-hover:scale-110 group-hover:rotate-3"
                        )} />
                    </Link>
                </Tooltip>
            )}

            {/* Profile Section with Dropdown */}
            <div className="pt-4 border-t border-border relative">
                {isExpanded ? (
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left justify-start"
                    >
                        <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden border border-border shrink-0">
                            {profileImage ? (
                                <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                                    {user?.name?.[0] || "U"}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-sm truncate">{user?.name || "User"}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Account</p>
                        </div>
                    </button>
                ) : (
                    <Tooltip label={user?.name || "Account"}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all justify-center group"
                        >
                            <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden border border-border shrink-0 transition-transform duration-150 group-hover:scale-110">
                                {profileImage ? (
                                    <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                                        {user?.name?.[0] || "U"}
                                    </div>
                                )}
                            </div>
                        </button>
                    </Tooltip>
                )}

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                    <div
                        className={cn(
                            "absolute bottom-full mb-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50",
                            isExpanded ? "left-0 right-0 mx-2" : "left-full ml-2 w-48"
                        )}
                    >
                        <div className="p-1">
                            <Link
                                href="/profile"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </Link>

                            {/* Theme Submenu */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowThemeSubmenu(true)}
                                onMouseLeave={() => setShowThemeSubmenu(false)}
                            >
                                <button
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {theme === "daybreak" ? <Sun className="w-4 h-4" /> :
                                            theme === "midnight" ? <Moon className="w-4 h-4" /> :
                                                <Monitor className="w-4 h-4" />}
                                        <span>Theme</span>
                                    </div>
                                    <ChevronRight className={cn("w-4 h-4 transition-transform", showThemeSubmenu && "rotate-90")} />
                                </button>

                                {showThemeSubmenu && (
                                    <div className="pl-6 pb-1">
                                        <button
                                            onClick={() => handleThemeChange("daybreak")}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors text-left",
                                                theme === "daybreak" && "text-primary"
                                            )}
                                        >
                                            <Sun className="w-4 h-4" />
                                            <span>Light</span>
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange("midnight")}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors text-left",
                                                theme === "midnight" && "text-primary"
                                            )}
                                        >
                                            <Moon className="w-4 h-4" />
                                            <span>Dark</span>
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange("paperback")}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors text-left",
                                                theme === "paperback" && "text-primary"
                                            )}
                                        >
                                            <Book className="w-4 h-4" />
                                            <span>System</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border my-1" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors text-red-500"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close menu */}
            {showProfileMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowProfileMenu(false);
                        setShowThemeSubmenu(false);
                    }}
                />
            )}
        </aside>
    );
}
