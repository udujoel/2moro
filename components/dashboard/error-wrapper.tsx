"use client";

import { ErrorBoundary, CompactErrorFallback } from "@/components/error-boundary";

interface DashboardErrorWrapperProps {
    children: React.ReactNode;
    section?: string;
}

/**
 * Client wrapper to add error boundaries to dashboard sections.
 * Catches JavaScript errors in child components and displays fallback UI.
 */
export function DashboardErrorWrapper({ children, section }: DashboardErrorWrapperProps) {
    return (
        <ErrorBoundary
            fallback={
                <CompactErrorFallback
                    onRetry={() => window.location.reload()}
                />
            }
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Wrapper specifically for widgets that may fail to load data
 */
export function WidgetErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}
