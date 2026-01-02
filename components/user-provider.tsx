"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserContextType {
    profileImage: string | null;
    onboardingCompleted: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    updateProfileImage: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Load state from localStorage on mount
        const storedImage = localStorage.getItem("profileImage");
        const storedStatus = localStorage.getItem("onboardingCompleted");

        if (storedImage) setProfileImage(storedImage);
        if (storedStatus === "true") setOnboardingCompleted(true);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem("onboardingCompleted", "true");
        setOnboardingCompleted(true);
        router.push("/dashboard");
    };

    const resetOnboarding = () => {
        localStorage.removeItem("onboardingCompleted");
        setOnboardingCompleted(false);
        router.push("/onboarding");
    };

    const updateProfileImage = (url: string) => {
        setProfileImage(url);
        localStorage.setItem("profileImage", url);
    };

    return (
        <UserContext.Provider value={{ profileImage, onboardingCompleted, completeOnboarding, resetOnboarding, updateProfileImage }}>
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
