import { getSessionUser } from "@/app/actions/auth";
import { getDashboardStats, getTopPeople, getAiGreeting, getAutobiographySnippets, getActivityData } from "@/app/actions/dashboard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AutobiographyWidget } from "@/components/dashboard/autobiography-widget";
import { TopPeople } from "@/components/dashboard/top-people";
import { AudioAgent } from "@/components/dashboard/audio-agent";
import { TopBar } from "@/components/top-bar";
import { redirect } from "next/navigation";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import Link from "next/link";

// Calendar is tricky to build from scratch quickly with "adjustable" features mentioned in prompt.
// We'll use a placeholder or simple calendar for now to meet the visual layout.
import { Calendar } from "lucide-react";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";

export default async function DashboardPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    const timeOfDay = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening";

    // Fetch all data in parallel
    const [stats, topPeople, aiContext, autobiography, activityData] = await Promise.all([
        getDashboardStats(),
        getTopPeople(),
        getAiGreeting(timeOfDay),
        getAutobiographySnippets(),
        getActivityData()
    ]);

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            {/* 1. Sidebar (Left) */}
            <Sidebar className="hidden md:flex shrink-0 z-30" />

            {/* 2. Main Content (Center) */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/10 relative">
                {/* Mobile Header / TopBar context */}
                <TopBar title="Dashboard" />

                <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
                    {/* Banner Header with Mic */}
                    <DashboardHeader greeting={aiContext.greeting} message={aiContext.message} />

                    {/* Breakdown (Stats) - No View All */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Breakdown</h2>
                        </div>
                        <StatsCards stats={stats} />
                    </div>

                    {/* Report Progress / Activity Log (replaces Work with Clients) */}
                    <div className="flex-1 min-h-0">
                        <ActivityFeed habits={activityData.habits} recentMemories={activityData.recentMemories} />
                    </div>
                </div>
            </main>

            {/* 3. Right Panel (Right) */}
            <aside className="hidden xl:flex w-96 flex-col border-l border-border bg-card p-6 space-y-6 overflow-hidden z-20 shadow-sm">

                {/* Calendar */}
                <div className="shrink-0">
                    <h3 className="font-bold text-lg mb-4">Calendar</h3>
                    <CalendarWidget />
                </div>

                {/* Autobiography / Earnings */}
                <div className="h-[200px] flex flex-col shrink-0">
                    <h3 className="font-bold text-lg mb-4">Autobiography</h3>
                    <AutobiographyWidget snippets={autobiography} />
                </div>

                {/* Connections (Moved from Main) */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Connections</h3>
                        <Link
                            href="/archive?view=people"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            View All
                        </Link>
                    </div>
                    <TopPeople people={topPeople} />
                </div>

            </aside>
            {/* AudioAgent removed from root (now in Header) */}
        </div>
    );
}
