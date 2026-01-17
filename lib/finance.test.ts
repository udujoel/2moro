import { describe, it, expect } from "vitest";
import {
    calculateInvestmentProjection,
    calculateFinancialHealthScore,
    getHealthRating,
    formatCurrency,
} from "./finance";

describe("calculateInvestmentProjection", () => {
    it("should calculate projection for 30 years at 7%", () => {
        const result = calculateInvestmentProjection(100, 30, 0.07);
        // $100/month for 30 years at 7% should be around $122,000
        expect(result).toBeGreaterThan(100000);
        expect(result).toBeLessThan(150000);
    });

    it("should return 0 for 0 monthly investment", () => {
        const result = calculateInvestmentProjection(0, 10, 0.07);
        expect(result).toBe(0);
    });

    it("should use default 7% return if not specified", () => {
        const resultDefault = calculateInvestmentProjection(100, 10);
        const resultExplicit = calculateInvestmentProjection(100, 10, 0.07);
        expect(resultDefault).toBe(resultExplicit);
    });

    it("should handle short time periods", () => {
        const result = calculateInvestmentProjection(500, 1, 0.07);
        // Roughly $500 * 12 + some interest
        expect(result).toBeGreaterThan(6000);
        expect(result).toBeLessThan(7000);
    });
});

describe("calculateFinancialHealthScore", () => {
    it("should return high score for excellent finances", () => {
        const score = calculateFinancialHealthScore({
            debt: 0,
            liabilities: 0,
            assets: 200000,
            cash: 50000,
        });
        expect(score).toBeGreaterThanOrEqual(80);
    });

    it("should return low score for poor finances", () => {
        const score = calculateFinancialHealthScore({
            debt: 100000,
            liabilities: 50000,
            assets: 5000,
            cash: 500,
        });
        expect(score).toBeLessThan(50);
    });

    it("should return good score for average finances", () => {
        const score = calculateFinancialHealthScore({
            debt: 20000,
            liabilities: 5000,
            assets: 50000,
            cash: 10000,
        });
        // This is actually a pretty good financial position (net worth ~35k, good cash)
        expect(score).toBeGreaterThanOrEqual(60);
        expect(score).toBeLessThanOrEqual(100);
    });

    it("should always return score between 0 and 100", () => {
        const extremeGood = calculateFinancialHealthScore({
            debt: 0,
            liabilities: 0,
            assets: 10000000,
            cash: 1000000,
        });
        const extremeBad = calculateFinancialHealthScore({
            debt: 1000000,
            liabilities: 500000,
            assets: 0,
            cash: 0,
        });

        expect(extremeGood).toBeLessThanOrEqual(100);
        expect(extremeGood).toBeGreaterThanOrEqual(0);
        expect(extremeBad).toBeLessThanOrEqual(100);
        expect(extremeBad).toBeGreaterThanOrEqual(0);
    });
});

describe("getHealthRating", () => {
    it("should return Excellent for score >= 80", () => {
        const rating = getHealthRating(85);
        expect(rating.label).toBe("Excellent");
        expect(rating.emoji).toBe("🌟");
    });

    it("should return Good for score >= 60", () => {
        const rating = getHealthRating(65);
        expect(rating.label).toBe("Good");
    });

    it("should return Fair for score >= 40", () => {
        const rating = getHealthRating(45);
        expect(rating.label).toBe("Fair");
    });

    it("should return Needs Improvement for score < 40", () => {
        const rating = getHealthRating(30);
        expect(rating.label).toBe("Needs Improvement");
        expect(rating.emoji).toBe("🚨");
    });
});

describe("formatCurrency", () => {
    it("should format whole numbers without decimals", () => {
        expect(formatCurrency(1000)).toBe("$1,000");
        expect(formatCurrency(1234567)).toBe("$1,234,567");
    });

    it("should round decimals", () => {
        expect(formatCurrency(1000.49)).toBe("$1,000");
        expect(formatCurrency(1000.50)).toBe("$1,001");
    });

    it("should handle zero", () => {
        expect(formatCurrency(0)).toBe("$0");
    });

    it("should handle negative numbers", () => {
        expect(formatCurrency(-5000)).toBe("-$5,000");
    });
});
