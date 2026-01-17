import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
    useSession: () => ({ data: null, status: "unauthenticated" }),
    signIn: vi.fn(),
    signOut: vi.fn(),
}));
