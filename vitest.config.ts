import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
        exclude: ["node_modules", ".next", "dist"],
        coverage: {
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                ".next/",
                "**/*.d.ts",
                "**/*.config.{ts,js}",
                "**/types/**",
            ],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
});
