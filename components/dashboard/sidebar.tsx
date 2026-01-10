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
                isExpanded ? "w-64 px-4 transition-all duration-300" : "w-[4.5rem] px-2 transition-all duration-300",
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
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex justify-center p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Open sidebar"
                    >
                        <PanelLeft className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center py-2.5 rounded-xl font-medium transition-colors overflow-hidden whitespace-nowrap group",
                            isExpanded ? "px-3 justify-start" : "px-0 justify-center",
                            pathname?.startsWith(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                        title={!isExpanded ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span
                            className={cn(
                                "whitespace-nowrap overflow-hidden transition-all duration-300",
                                isExpanded ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* MyStory Quick Link */}
            <Link
                href="/mystory"
                className={cn(
                    "flex items-center py-2.5 rounded-xl font-medium transition-colors overflow-hidden whitespace-nowrap group mb-4",
                    isExpanded ? "px-3 justify-start" : "px-0 justify-center",
                    pathname === "/mystory"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                title={!isExpanded ? "MyStory" : undefined}
            >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span
                    className={cn(
                        "whitespace-nowrap overflow-hidden transition-all duration-300",
                        isExpanded ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                    )}
                >
                    MyStory
                </span>
            </Link>

            {/* Profile Section with Dropdown */}
            <div className="pt-4 border-t border-border relative">
                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left",
                        isExpanded ? "justify-start" : "justify-center"
                    )}
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
                    {isExpanded && (
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-sm truncate">{user?.name || "User"}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Account</p>
                        </div>
                    )}
                </button>

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
                            <div className="relative">
                                <button
                                    onClick={() => setShowThemeSubmenu(!showThemeSubmenu)}
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
