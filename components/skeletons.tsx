"use client";

/**
 * Skeleton loading components for dashboard widgets
 */

export function StatCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-12 bg-muted rounded" />
        </div>
    );
}

export function StatsCardsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>
    );
}

export function ActivityFeedSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-3 w-1/4 bg-muted rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-muted rounded" />
                    <div className="w-8 h-8 bg-muted rounded" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded" />
                ))}
            </div>
        </div>
    );
}

export function TopPeopleSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function AutobiographySkeleton() {
    return (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 animate-pulse">
            <div className="space-y-3">
                <div className="h-4 w-full bg-muted/50 rounded" />
                <div className="h-4 w-5/6 bg-muted/50 rounded" />
                <div className="h-4 w-4/6 bg-muted/50 rounded" />
            </div>
        </div>
    );
}

export function DashboardHeaderSkeleton() {
    return (
        <div className="bg-gradient-to-r from-primary/60 to-purple-600/60 rounded-3xl p-8 mb-8 animate-pulse">
            <div className="space-y-3 max-w-xl">
                <div className="h-10 w-64 bg-white/20 rounded" />
                <div className="h-6 w-96 bg-white/10 rounded" />
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="p-8 space-y-8 animate-pulse">
            <DashboardHeaderSkeleton />
            <StatsCardsSkeleton />
            <ActivityFeedSkeleton />
        </div>
    );
}
