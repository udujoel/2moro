import { getSessionUser } from "@/app/actions/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SettingsShell } from "@/components/settings/settings-shell";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    // Fetch full user data
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userPreferences: true,
        },
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 md:px-8">
                    <h1 className="text-xl font-bold">Settings</h1>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold">My Account</h2>
                            <p className="text-muted-foreground">Manage your personal information and security.</p>
                        </div>

                        <SettingsShell user={user} />
                    </div>
                </main>
            </div>
        </div>
    );
}
