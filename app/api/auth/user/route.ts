import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/auth/user
 * Fetch full user data by ID (for hydrating UserProvider)
 */
export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                title: true,
                avatar: true,
                bio: true,
                onboardingCompleted: true,
                preferences: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("[Auth/User] Error fetching user:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
