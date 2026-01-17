import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (classnames utility)", () => {
    it("should merge class names correctly", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
        expect(cn("base", true && "included", false && "excluded")).toBe(
            "base included"
        );
    });

    it("should merge tailwind classes correctly", () => {
        // twMerge should resolve conflicting tailwind classes
        expect(cn("px-2", "px-4")).toBe("px-4");
        expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should handle undefined and null", () => {
        expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should handle empty inputs", () => {
        expect(cn()).toBe("");
        expect(cn("")).toBe("");
    });

    it("should handle arrays of classes", () => {
        expect(cn(["foo", "bar"])).toBe("foo bar");
    });
});
