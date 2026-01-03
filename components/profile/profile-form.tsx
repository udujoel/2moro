"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/components/user-provider";
import { updateUser } from "@/lib/actions";

export function ProfileForm() {
    const { user, profileImage, updateProfileImage, resetOnboarding } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Local state for form fields - initialized with user data
    // In a real app we'd use react-hook-form
    const [formData, setFormData] = useState({
        name: user?.name?.split(' ')[0] || "",
        lastName: user?.name?.split(' ')[1] || "",
        email: user?.email || "",
        username: user?.name?.toLowerCase().replace(/\s/g, '.') || "",
        title: user?.title || "Traveler",
        bio: user?.bio || "",
    });

    const handleUpload = () => {
        // Simulation of file upload
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
        if (user) {
            await updateUser(user.id, {
                name: `${formData.name} ${formData.lastName}`,
                title: formData.title,
                bio: formData.bio,
            });
        }
        setTimeout(() => setIsLoading(false), 800);
    };

    return (
        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex-1">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden border-4 border-background shadow-md relative group">
                    {profileImage || user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImage || user?.avatar || ""} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <User className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleUpload}
                        className="px-6 py-2 bg-red-400 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-red-400/20"
                    >
                        Upload
                    </button>
                    <button
                        onClick={() => updateProfileImage("")}
                        className="px-6 py-2 border border-border hover:bg-secondary rounded-xl text-sm font-medium transition-colors text-red-400 hover:text-red-500"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">First Name <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Last Name <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Email <span className="text-red-400">*</span></label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent opacity-60 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Username <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={formData.username}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent focus:bg-background outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Date of Birth <span className="text-red-400">*</span></label>
                        <input
                            type="date"
                            defaultValue="1995-01-14"
                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Country <span className="text-red-400">*</span></label>
                        <select className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 outline-none appearance-none">
                            <option>United States</option>
                            <option>Canada</option>
                            <option>United Kingdom</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Address <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        defaultValue="4821 Ridge Top Cir, Anchorage, AK, 99516"
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                    <button
                        type="button"
                        onClick={resetOnboarding}
                        className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors"
                    >
                        Redo Onboarding
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
