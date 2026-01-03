"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    name: string;
    email: string;
    title?: string;
    avatar?: string | null;
}

interface UserContextType {
    user: User | null;
    login: (name?: string, email?: string) => void;
    logout: () => void;
    profileImage: string | null;
    onboardingCompleted: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    updateProfileImage: (url: string) => void;
    updateProfile: (data: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Load state from localStorage on mount
        const storedUser = localStorage.getItem("user");
        const storedImage = localStorage.getItem("profileImage");
        const storedStatus = localStorage.getItem("onboardingCompleted");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else if (process.env.NODE_ENV === "development") {
            // Auto-login as Tim Watson in Dev if no user found
            const devUser: User = {
                name: "Tim Watson",
                email: "tim@2moro.app",
                title: "The Architect",
                avatar: null
            };
            setUser(devUser);
            // In dev, we can treat onboarding as done for Tim by default? 
            // The prompt says "Tim's account should open". 
            // So let's ensure onboarding is true if it wasn't set.
            if (!storedStatus) {
                setOnboardingCompleted(true);
            }
        }

        if (storedImage) setProfileImage(storedImage);
        if (storedStatus === "true") setOnboardingCompleted(true);
    }, []);

    const login = (name: string = "Tim Watson", email: string = "tim@2moro.app") => {
        const newUser: User = {
            name,
            email,
            title: "The Architect",
            avatar: profileImage
        };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setOnboardingCompleted(true);
        localStorage.setItem("onboardingCompleted", "true");
        router.push("/dashboard");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        // We might want to keep onboarding status or reset it? 
        // Usually logout just clears the session.
        // But for this app, let's redirect to a login/onboarding page.
        router.push("/login");
    };

    const completeOnboarding = () => {
        localStorage.setItem("onboardingCompleted", "true");
        setOnboardingCompleted(true);
        router.push("/dashboard");
    };

    const resetOnboarding = () => {
        localStorage.removeItem("onboardingCompleted");
        localStorage.removeItem("user");
        setUser(null);
        setOnboardingCompleted(false);
        router.push("/onboarding");
    };

    const updateProfileImage = (url: string) => {
        setProfileImage(url);
        localStorage.setItem("profileImage", url);
        if (user) {
            const updatedUser = { ...user, avatar: url };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }
    };

    const updateProfile = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout,
            profileImage,
            onboardingCompleted,
            completeOnboarding,
            resetOnboarding,
            updateProfileImage,
            updateProfile
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
