import { getSessionUser } from "@/app/actions/auth";
import { getHabits } from "@/app/actions/habits";
import { getUserPreferences } from "@/app/actions/user";
import { HabitStack } from "@/components/dashboard/habit-stack";
import { ImpactSlider } from "@/components/dashboard/impact-slider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    const [habits, preferences] = await Promise.all([
        getHabits(userId),
        getUserPreferences(userId)
    ]);

    const impactValue = (preferences as any)?.impactValue ?? 50;

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar className="hidden md:flex border-r border-border" />

            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border flex items-center px-6 justify-between md:justify-end">
                    <div className="flex items-center gap-4">
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                    <div>
                        <h1 className="text-3xl font-bold">Compass</h1>
                        <p className="text-muted-foreground">Navigate your daily actions to shape your future.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">Today's Discipline</h2>
                            <ImpactSlider initialValue={impactValue} userId={userId} />
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">Atomic Habits</h2>
                            <HabitStack initialHabits={habits} userId={userId} />
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
