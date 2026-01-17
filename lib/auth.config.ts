import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth configuration.
 * Used by middleware.ts for route protection.
 * Does NOT include Prisma or other Node-only dependencies.
 */
export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Define public routes that don't require authentication
            const publicRoutes = ["/", "/login", "/signup"];
            const isPublicRoute = publicRoutes.includes(pathname);
            const isAuthApiRoute = pathname.startsWith("/api/auth");

            // Allow public routes and auth API
            if (isPublicRoute || isAuthApiRoute) {
                // If logged in and trying to access login, redirect to dashboard
                if (isLoggedIn && pathname === "/login") {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // For protected routes, require authentication
            if (!isLoggedIn) {
                // Redirect to login with callback URL
                const callbackUrl = encodeURIComponent(pathname);
                return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
            }

            return true;
        },
    },
    providers: [], // Providers are added in auth.ts (Node environment)
} satisfies NextAuthConfig;
