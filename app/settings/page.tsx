import { getSessionUser } from "@/app/actions/auth";
import { getOrCreateUser } from "@/lib/actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeCustomizer } from "@/components/settings/theme-customizer";
import { redirect } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default async function SettingsPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    // We don't have a direct getUserById action yet, reuse getOrCreate or add one. 
    // Actually we have getUserPreferences, but we want full profile. 
    // Let's assume we can fetch it via prisma or just use a new action if needed.
    // Ideally we should have `getUser(id)`.
    // I'll update `app/actions/user.ts` to include `getUser(id)` or just use `getOrCreateUser` if I have email... 
    // Wait, cookie only store ID. 
    // I need `getUser` by ID. I will implement it inline or update actions. 
    // Let's update `app/actions/user.ts` to export `getUser`.

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
