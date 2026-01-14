"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { updateUser } from "@/lib/actions";

interface User {
    id: string;
    name: string | null;
    email: string;
    title?: string | null;
    avatar?: string | null;
    bio?: string | null;
    onboardingCompleted: boolean;
    preferences?: any;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
    profileImage: string | null;
    onboardingCompleted: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    updateProfileImage: (url: string) => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch full user data from database when session changes
    useEffect(() => {
        const fetchUserData = async () => {
            if (status === "loading") {
                return;
            }

            if (status === "authenticated" && session?.user?.id) {
                try {
                    // Fetch full user data from database
                    const response = await fetch(`/api/auth/user?id=${session.user.id}`);
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        // Fallback to session data
                        setUser({
                            id: session.user.id,
                            email: session.user.email || "",
                            name: session.user.name || null,
                            avatar: session.user.image || null,
                            onboardingCompleted: false,
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    // Fallback to session data
                    setUser({
                        id: session.user.id,
                        email: session.user.email || "",
                        name: session.user.name || null,
                        avatar: session.user.image || null,
                        onboardingCompleted: false,
                    });
                }
            } else {
                setUser(null);
            }

            setIsLoading(false);
        };

        fetchUserData();
    }, [session, status]);

    const logout = useCallback(async () => {
        await signOut({ callbackUrl: "/login" });
    }, []);

    const completeOnboarding = async () => {
        if (!user) return;
        await updateUser(user.id, { onboardingCompleted: true });
        setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
        router.push("/dashboard");
    };

    const resetOnboarding = async () => {
        router.push("/onboarding");
    };

    const updateProfileImage = async (url: string) => {
        if (!user) return;
        await updateUser(user.id, { avatar: url });
        setUser(prev => prev ? { ...prev, avatar: url } : null);
    };

    const updateProfileAction = async (data: Partial<User>) => {
        if (!user) return;
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
            isLoading,
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
