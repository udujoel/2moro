import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
    // Note: We're NOT using PrismaAdapter because it conflicts with JWT sessions
    // and causes oversized cookies. We handle user lookup manually.
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        // Credentials provider for "Login as Default User" in development
        Credentials({
            id: "dev-login",
            name: "Development Login",
            credentials: {
                email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
                // Only allow in development
                // Environment check removed to allow default login in production as requested
                // if (process.env.NODE_ENV !== "development") {
                //     return null;
                // }

                const email = credentials?.email as string;
                if (!email) return null;

                // Find or create the default user
                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: "Tim Watson",
                            title: "Traveler",
                        },
                    });
                }

                // CRITICAL: Do NOT return the full user object or image here if it's large (base64)
                // This data ends up in the JWT token. If the image is a massive base64 string,
                // it will blow up the cookie size (>4KB) and cause HTTP 431 errors.
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    // image: user.avatar, // OMIT IMAGE entirely from token to keep it small
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // On initial sign in, add user id to token
            if (user) {
                token.id = user.id;
                // token.picture = user.image; // Do NOT add large image to token
            }
            // For Google OAuth, look up or create user
            if (account?.provider === "google" && user?.email) {
                let dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });
                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "User",
                            avatar: user.image,
                        },
                    });
                }
                token.id = dbUser.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    debug: process.env.NODE_ENV === "development",
});
