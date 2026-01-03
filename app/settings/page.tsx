"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Play, RotateCcw, User, Shield, Database, Upload, Save, Download, Trash2, Key, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useUser } from "@/components/user-provider";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const router = useRouter();
    const { user, profileImage, updateProfileImage, updateProfile, resetOnboarding } = useUser();

    // Local state for profile form
    const [name, setName] = useState(user?.name || "");
    const [title, setTitle] = useState(user?.title || "");
    const [bio, setBio] = useState("Architecting my future, one habit at a time."); // Mock bio if not in user model yet, or add to user model
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "account" | "data">("profile");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            updateProfile({ name, title });
            setIsLoading(false);
            // Could add toast here
        }, 800);
    };

    const handleExportData = () => {
        const data = {
            user,
            profileImage,
            // In a real app, fetches all memories/habits
            exportDate: new Date().toISOString(),
            app: "2moro"
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "2moro-export.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "account", label: "Account", icon: Shield },
        { id: "data", label: "Data & Privacy", icon: Database },
    ] as const;

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-lg">
                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="w-3 h-3 fill-primary text-primary" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">Manage your identity and digital footprint.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Settings Navigation */}
                        <div className="w-full md:w-64 space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground font-semibold shadow-md" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-card border border-border rounded-3xl p-8 shadow-sm min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {activeTab === "profile" && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className="relative group">
                                                <div
                                                    onClick={handleAvatarClick}
                                                    className="w-24 h-24 rounded-full bg-muted border-2 border-border overflow-hidden cursor-pointer shadow-lg group-hover:ring-4 group-hover:ring-primary/20 transition-all"
                                                >
                                                    {profileImage || user?.avatar ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={profileImage || user?.avatar || ""} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                                            <User className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Upload className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <p className="text-xs text-muted-foreground text-center mt-2">Click to upload</p>
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-sm font-semibold ml-1">Display Name</label>
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-sm font-semibold ml-1">Title / Role</label>
                                                        <input
                                                            type="text"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            placeholder="e.g. The Explorer"
                                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-semibold ml-1">Life Mission / Bio</label>
                                                    <textarea
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                        className="w-full h-24 bg-muted/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                                    />
                                                </div>

                                                <div className="pt-4 flex justify-end">
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={isLoading}
                                                        className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                                    >
                                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "account" && (
                                    <motion.div
                                        key="account"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4 max-w-lg">
                                            <h2 className="text-xl font-bold flex items-center gap-2">
                                                <Key className="w-5 h-5 text-primary" />
                                                Security
                                            </h2>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user?.email || ""}
                                                    readOnly
                                                    className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-muted-foreground cursor-not-allowed"
                                                />
                                                <p className="text-xs text-muted-foreground ml-1">Contact support to change your email.</p>
                                            </div>

                                            <div className="pt-4">
                                                <button className="px-4 py-2 border border-border rounded-xl font-medium hover:bg-muted transition-colors text-sm">
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "data" && (
                                    <motion.div
                                        key="data"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4">
                                            <h2 className="text-xl font-bold flex items-center gap-2">
                                                <Database className="w-5 h-5 text-primary" />
                                                Data Management
                                            </h2>
                                            <p className="text-sm text-muted-foreground">You own your data. Export it anytime or wipe it clean.</p>

                                            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">Export JSON</p>
                                                    <p className="text-xs text-muted-foreground">Download a copy of your profile and habits.</p>
                                                </div>
                                                <button
                                                    onClick={handleExportData}
                                                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted transition-colors rounded-lg text-sm font-medium shadow-sm"
                                                >
                                                    <Download className="w-4 h-4" /> Export
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-border pt-8 space-y-4">
                                            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                                                <Shield className="w-5 h-5" />
                                                Danger Zone
                                            </h2>

                                            <div className="grid gap-4">
                                                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-red-900 dark:text-red-200">Reset Onboarding</p>
                                                        <p className="text-xs text-red-700 dark:text-red-400">Go through the setup process again. Keeps data.</p>
                                                    </div>
                                                    <button
                                                        onClick={resetOnboarding}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors rounded-lg text-sm font-medium shadow-sm"
                                                    >
                                                        <RotateCcw className="w-4 h-4" /> Reset
                                                    </button>
                                                </div>

                                                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                                    <div>
                                                        <p className="font-semibold text-red-900 dark:text-red-200">Delete Account</p>
                                                        <p className="text-xs text-red-700 dark:text-red-400">Permanently delete all local data and reset.</p>
                                                    </div>
                                                    <button
                                                        onClick={resetOnboarding}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg text-sm font-medium shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
