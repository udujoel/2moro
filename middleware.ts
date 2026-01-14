import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicPaths = [
    "/login",
    "/api/auth",
];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth?.user;
    const path = nextUrl.pathname;

    // Check if it's a public path
    const isPublicPath = publicPaths.some(p =>
        path === p || path.startsWith(`${p}/`)
    );

    // Root path is special - redirect to dashboard if logged in, login if not
    if (path === "/") {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
        } else {
            return NextResponse.redirect(new URL("/login", nextUrl.origin));
        }
    }

    // Allow public paths
    if (isPublicPath) {
        // If logged in and on login page, redirect to dashboard
        if (isLoggedIn && path === "/login") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
        }
        return NextResponse.next();
    }

    // Protected paths - require authentication
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Match all routes except static files
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
