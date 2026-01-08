/**
 * Financial utilities for calculations and API integrations
 */

/**
 * Calculate compound interest projection
 */
export function calculateInvestmentProjection(
    monthlyInvestment: number,
    years: number,
    annualReturn: number = 0.07
): number {
    const monthlyRate = annualReturn / 12;
    const months = years * 12;

    // Future value of annuity formula
    const futureValue =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);

    return Math.round(futureValue);
}

/**
 * Calculate financial health score (0-100)
 * Based on debt-to-income, assets, and savings
 */
export function calculateFinancialHealthScore(data: {
    debt: number;
    liabilities: number;
    assets: number;
    cash: number;
    monthlyIncome?: number;
}): number {
    let score = 50; // Start at neutral

    const totalDebt = data.debt + data.liabilities;
    const totalAssets = data.assets + data.cash;
    const netWorth = totalAssets - totalDebt;

    // Net worth contribution (40 points)
    if (netWorth > 100000) score += 40;
    else if (netWorth > 50000) score += 30;
    else if (netWorth > 10000) score += 20;
    else if (netWorth > 0) score += 10;
    else if (netWorth < -50000) score -= 30;
    else if (netWorth < 0) score -= 20;

    // Debt-to-asset ratio (30 points)
    if (totalAssets > 0) {
        const debtRatio = totalDebt / totalAssets;
        if (debtRatio < 0.2) score += 30;
        else if (debtRatio < 0.4) score += 20;
        else if (debtRatio < 0.6) score += 10;
        else if (debtRatio > 1.5) score -= 20;
        else if (debtRatio > 1) score -= 10;
    }

    // Cash reserves (20 points)
    if (data.cash > 20000) score += 20;
    else if (data.cash > 10000) score += 15;
    else if (data.cash > 5000) score += 10;
    else if (data.cash < 1000) score -= 10;

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Get financial health rating based on score
 */
export function getHealthRating(score: number): {
    label: string;
    color: string;
    emoji: string;
} {
    if (score >= 80)
        return { label: "Excellent", color: "text-green-500", emoji: "🌟" };
    if (score >= 60)
        return { label: "Good", color: "text-blue-500", emoji: "👍" };
    if (score >= 40)
        return { label: "Fair", color: "text-yellow-500", emoji: "⚠️" };
    return { label: "Needs Improvement", color: "text-red-500", emoji: "🚨" };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Fetch S&P 500 data (simplified - in production use a real API)
 * For now, return mock data
 */
export async function getSP500Data(): Promise<
    Array<{ date: string; value: number }>
> {
    // In production, use Yahoo Finance API or similar
    // For now, generate mock data for the last year
    const data = [];
    const today = new Date();
    const startValue = 4000;

    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Simulate some growth with randomness
        const trend = (365 - i) * 2; // Upward trend
        const randomness = Math.random() * 100 - 50;
        const value = startValue + trend + randomness;

        data.push({
            date: date.toISOString().split("T")[0],
            value: Math.round(value),
        });
    }

    return data;
}

/**
 * Fetch stock portfolio performance
 * In production, this would call a real stock API
 */
export async function getPortfolioData(
    stocks: Array<{ symbol: string; shares: number }>
): Promise<Array<{ date: string; value: number }>> {
    // Mock implementation
    // In production, fetch real stock data and calculate portfolio value
    return getSP500Data(); // For now, just return S&P 500 as placeholder
}
