import { getSessionUser } from "@/app/actions/auth";
import { getOrCreateUser } from "@/lib/actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeCustomizer } from "@/components/settings/theme-customizer";
import { LocationToggle } from "@/components/settings/location-toggle";
import { CalendarIntegration } from "@/components/settings/calendar-integration";
import { redirect } from "next/navigation";
import { LogOut, User, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    // Fetch full user data to get preferences
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userPreferences: true,
        },
    });

    const isCalendarConnected = user?.userPreferences?.googleCalendarEnabled ?? false;

    console.log('[Settings] User preferences:', {
        userId,
        hasPrefs: !!user?.userPreferences,
        googleCalendarEnabled: user?.userPreferences?.googleCalendarEnabled,
        hasAccessToken: !!user?.userPreferences?.googleAccessToken,
        hasRefreshToken: !!user?.userPreferences?.googleRefreshToken,
    });

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <div className="flex items-center gap-4">
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">Manage your preferences and account.</p>
                    </div>

                    <div className="grid gap-8">
                        {/* Appearance Section */}
                        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                            <ThemeCustomizer />
                        </section>

                        {/* Integrations Section */}
                        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-semibold">Integrations</h2>
                            </div>
                            <CalendarIntegration
                                userId={userId}
                                isConnected={isCalendarConnected}
                            />
                        </section>

                        {/* Privacy & Data */}
                        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Privacy & Data</h2>
                            <LocationToggle
                                userId={userId}
                                initialEnabled={(user?.preferences as any)?.locationEnabled ?? false}
                            />
                        </section>

                        {/* App Info */}
                        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Account</h2>
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">User Profile</p>
                                    <p className="text-sm text-muted-foreground">Manage your personal details across 2moro.</p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <form action={async () => {
                                    "use server";
                                    const { logoutAction } = await import("@/app/actions/auth");
                                    await logoutAction();
                                    redirect("/login");
                                }}>
                                    <button className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2 rounded-lg transition-colors">
                                        <LogOut className="w-4 h-4" />
                                        Log Out
                                    </button>
                                </form>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
