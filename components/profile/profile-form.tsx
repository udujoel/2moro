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
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12 border-b border-border pb-8">
                <div className="w-28 h-28 rounded-full bg-secondary overflow-hidden border-4 border-background shadow-xl ring-1 ring-border relative group">
                    {profileImage || user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImage || user?.avatar || ""} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                            <User className="w-10 h-10" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 pt-2 text-center sm:text-left">
                    <h3 className="font-semibold text-lg">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
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

            {/* Form Fields */}
            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">First Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-transparent text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-transparent focus:bg-background outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Date of Birth</label>
                        <input
                            type="date"
                            defaultValue="1995-01-14"
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-transparent focus:bg-background focus:border-primary/50 outline-none font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Country</label>
                        <select className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-transparent focus:bg-background focus:border-primary/50 outline-none appearance-none font-medium">
                            <option>United States</option>
                            <option>Canada</option>
                            <option>United Kingdom</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Address</label>
                    <input
                        type="text"
                        defaultValue="4821 Ridge Top Cir, Anchorage, AK, 99516"
                        className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                    />
                </div>

                <div className="pt-8 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={resetOnboarding}
                        className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        Redo Onboarding
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
