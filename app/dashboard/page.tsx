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

// Calendar is tricky to build from scratch quickly with "adjustable" features mentioned in prompt.
// We'll use a placeholder or simple calendar for now to meet the visual layout.
import { Calendar } from "lucide-react";

export default async function DashboardPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    const timeOfDay = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening";

    // Fetch all data in parallel
    const [stats, topPeople, aiContext, autobiography, activityData] = await Promise.all([
        getDashboardStats(userId),
        getTopPeople(userId),
        getAiGreeting(userId, timeOfDay),
        getAutobiographySnippets(userId),
        getActivityData(userId)
    ]);

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            {/* 1. Sidebar (Left) */}
            <Sidebar className="hidden md:flex shrink-0 z-30" />

            {/* 2. Main Content (Center) */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/10 relative">
                {/* Mobile Header / TopBar context */}
                <TopBar title="Dashboard" />

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    {/* Banner Header with Mic */}
                    <DashboardHeader greeting={aiContext.greeting} message={aiContext.message} />

                    {/* Breakdown (Stats) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Breakdown</h2>
                            <button className="text-sm text-muted-foreground hover:text-primary">View All</button>
                        </div>
                        <StatsCards stats={stats} />
                    </div>

                    {/* Report Progress / Activity Log (replaces Work with Clients) */}
                    <div className="space-y-4 h-[400px]">
                        <ActivityFeed habits={activityData.habits} recentMemories={activityData.recentMemories} />
                    </div>
                </div>
            </main>

            {/* 3. Right Panel (Right) */}
            <aside className="hidden xl:flex w-96 flex-col border-l border-border bg-card p-6 space-y-8 overflow-y-auto z-20 shadow-sm">

                {/* Profile / Work History Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Work History</h3>
                        <button className="p-2 hover:bg-muted rounded-full transition-colors"><Calendar className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Calendar */}
                <div>
                    <h3 className="font-bold text-lg mb-4">Schedule Calendar</h3>
                    <div className="bg-secondary/20 rounded-2xl p-4 border border-border flex flex-col items-center justify-center min-h-[200px]">
                        <Calendar className="w-10 h-10 text-primary mb-2 opacity-50" />
                        <span className="text-sm font-medium">Calendar Module</span>
                    </div>
                </div>

                {/* Autobiography / Earnings */}
                <div className="min-h-[250px]">
                    <h3 className="font-bold text-lg mb-4">Autobiography</h3>
                    <AutobiographyWidget snippets={autobiography} />
                </div>

                {/* Connections (Moved from Main) */}
                <div className="flex-1 min-h-[300px]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Connections</h3>
                        <button className="text-sm text-muted-foreground hover:text-primary">View All</button>
                    </div>
                    <TopPeople people={topPeople} />
                </div>

            </aside>
            {/* AudioAgent removed from root (now in Header) */}
        </div>
    );
}
