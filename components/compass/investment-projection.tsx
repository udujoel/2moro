"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { calculateInvestmentProjection, formatCurrency } from "@/lib/finance";
import { getUserPreferences, updateInvestmentPreference } from "@/app/actions/compass";

interface InvestmentProjectionProps { }

const INVESTMENT_OPTIONS = [50, 100, 200, 500, 1000, 2000, 5000];
const MILESTONES = [
    { years: 5, label: "5 Years" },
    { years: 10, label: "10 Years" },
    { years: 20, label: "20 Years" },
    { years: 40, label: "40 Years" },
];

export function InvestmentProjection({ }: InvestmentProjectionProps) {
    const [monthlyInvestment, setMonthlyInvestment] = useState(100);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setIsLoading(true);
        const result = await getUserPreferences();
        if (result.success && result.preferences) {
            setMonthlyInvestment(result.preferences.monthlyInvestment);
        }
        setIsLoading(false);
    };

    const handleChange = async (value: number) => {
        setMonthlyInvestment(value);
        setIsSaving(true);
        await updateInvestmentPreference(value);
        setIsSaving(false);
    };

    const projections = MILESTONES.map((milestone) => ({
        ...milestone,
        value: calculateInvestmentProjection(monthlyInvestment, milestone.years),
    }));

    const maxValue = Math.max(...projections.map((p) => p.value));

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-secondary rounded w-1/3"></div>
                    <div className="h-32 bg-secondary rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Investment Projection</h3>
                    <p className="text-sm text-muted-foreground">
                        Assuming 7% average annual return
                    </p>
                </div>
            </div>

            {/* Monthly Investment Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                    Monthly Investment Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {INVESTMENT_OPTIONS.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => handleChange(amount)}
                            disabled={isSaving}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${monthlyInvestment === amount
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                                } disabled:opacity-50`}
                        >
                            {amount >= 1000 ? `$${amount / 1000}K` : `$${amount}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projection Chart */}
            <div className="space-y-4">
                {projections.map((projection, index) => {
                    const percentage = (projection.value / maxValue) * 100;
                    const totalInvested = monthlyInvestment * 12 * projection.years;
                    const earnings = projection.value - totalInvested;

                    return (
                        <motion.div
                            key={projection.years}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{projection.label}</span>
                                <div className="text-right">
                                    <span className="font-bold text-green-500">
                                        {formatCurrency(projection.value)}
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        +{formatCurrency(earnings)} earnings
                                    </p>
                                </div>
                            </div>
                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>
                        Investing <span className="font-semibold text-foreground">${monthlyInvestment}/month</span> could
                        grow to{" "}
                        <span className="font-semibold text-green-500">
                            {formatCurrency(projections[projections.length - 1].value)}
                        </span>{" "}
                        in 40 years
                    </span>
                </div>
            </div>
        </div>
    );
}
