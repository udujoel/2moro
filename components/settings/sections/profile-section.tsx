"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/components/user-provider";
import { updateUser } from "@/lib/actions";

interface ProfileSectionProps {
    user: any; // Using existing type from settings shell or broad type
}

export function ProfileSection({ user: initialUser }: ProfileSectionProps) {
    const { profileImage, updateProfileImage, resetOnboarding } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Initial state from props or context
    const [formData, setFormData] = useState({
        name: initialUser?.name?.split(' ')[0] || "",
        lastName: initialUser?.name?.split(' ')[1] || "",
        email: initialUser?.email || "",
        username: initialUser?.name?.toLowerCase().replace(/\s/g, '.') || "",
        title: initialUser?.title || "Traveler",
        bio: initialUser?.bio || "",
    });

    const handleUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    updateProfileImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (initialUser?.id) {
            await updateUser(initialUser.id, {
                name: `${formData.name} ${formData.lastName}`.trim(),
                title: formData.title,
                bio: formData.bio,
            });
        }
        setTimeout(() => setIsLoading(false), 800);
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-6">Profile Picture</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden border-2 border-border relative">
                        {profileImage || initialUser?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profileImage || initialUser?.avatar || ""} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                <User className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 text-center sm:text-left">
                        <p className="text-sm text-muted-foreground max-w-xs">
                            This image will be used for your neural identity in the simulation.
                        </p>
                        <div className="flex gap-3 justify-center sm:justify-start">
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
                            >
                                Change Photo
                            </button>
                            <button
                                onClick={() => updateProfileImage("")}
                                className="px-4 py-2 border border-border hover:bg-muted rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">First Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-lg bg-muted/20 border border-transparent text-muted-foreground cursor-not-allowed text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm"
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>

            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h2 className="text-lg font-semibold mb-2">Setup & Onboarding</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-lg">
                    Revisit the onboarding flow to update your goals, biography, and core preferences.
                    This allows you to restart your journey with 2moro without losing your history.
                </p>

                <button
                    type="button"
                    onClick={resetOnboarding}
                    className="relative overflow-hidden group px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="relative flex items-center gap-2 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                        <span>Redo Onboarding Journey</span>
                    </div>
                </button>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account. This action is irreversible and will remove all your data.
                </p>

                <button
                    onClick={async () => {
                        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                            await import("@/app/actions/user").then(mod => mod.deleteAccount());
                            window.location.href = "/login";
                        }
                    }}
                    className="px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}
