"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUser, updateUser } from "@/lib/actions";

interface User {
    id: string; // Add ID for DB operations
    name: string | null;
    email: string;
    title?: string | null;
    avatar?: string | null;
    bio?: string | null;
    onboardingCompleted: boolean;
}

interface UserContextType {
    user: User | null;
    login: (name?: string, email?: string) => Promise<void>;
    logout: () => void;
    // Helper to keep UI consistent, though strictly we use user object now
    profileImage: string | null;
    onboardingCompleted: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    updateProfileImage: (url: string) => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Hydrate from localStorage for valid session check? 
        // OR better: check for a simple "userId" in local storage to fetch fresh data?
        // For this hybrid approach (Client Component + Server Actions), we'll do:
        // 1. Check if we have a userId in localStorage.
        // 2. If yes, fetch that user from DB to get latest state.
        // 3. If no, and DEV, do auto-login.

        const initUser = async () => {
            const storedEmail = localStorage.getItem("userEmail");

            if (storedEmail) {
                // Refresh data
                const userData = await getOrCreateUser(storedEmail, "User"); // Name is fallback
                if (userData) setUser(userData);
            } else if (process.env.NODE_ENV === "development") {
                // Auto-login Tim
                await login("Tim Watson", "tim@2moro.app");
            }
        };

        initUser();
    }, []);

    const login = async (name: string = "Tim Watson", email: string = "tim@2moro.app") => {
        // Call Server Action
        const dbUser = await getOrCreateUser(email, name);
        if (dbUser) {
            setUser(dbUser);
            localStorage.setItem("userEmail", email);
            if (dbUser.onboardingCompleted) {
                // router.push("/dashboard"); // Optional: let the page handle redirect logic based on state
            }
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("userEmail");
        router.push("/login");
    };

    const completeOnboarding = async () => {
        if (!user) return;
        await updateUser(user.id, { onboardingCompleted: true });
        setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
        router.push("/dashboard");
    };

    const resetOnboarding = async () => {
        if (!user) return;
        await updateUser(user.id, { onboardingCompleted: false });
        // Don't fully logout, just reset status
        setUser(prev => prev ? { ...prev, onboardingCompleted: false } : null);
        router.push("/onboarding");
    };

    const updateProfileImage = async (url: string) => {
        if (!user) return;
        await updateUser(user.id, { avatar: url });
        setUser(prev => prev ? { ...prev, avatar: url } : null);
    };

    const updateProfileAction = async (data: Partial<User>) => {
        if (!user) return;
        // Clean data for Prisma (undefined instead of null)
        const cleanData: any = { ...data };
        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === null) cleanData[key] = undefined;
        });

        await updateUser(user.id, cleanData);
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout,
            profileImage: user?.avatar || null,
            onboardingCompleted: user?.onboardingCompleted || false,
            completeOnboarding,
            resetOnboarding,
            updateProfileImage,
            updateProfile: updateProfileAction
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
