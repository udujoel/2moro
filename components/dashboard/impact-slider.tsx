"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ImpactSlider() {
    const [value, setValue] = useState(50);

    // Predict future based on slider value (mock logic)
    const predictedBalance = 5000 + (value * 1000); // 5000 to 105000
    const predictedHealth = 50 + (value * 0.4); // 50 to 90

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Discipline Level</span>
                    <span className="font-bold text-primary">{value}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Future Projection (2030)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Savings Account</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold font-mono">
                                ${predictedBalance.toLocaleString()}
                            </span>
                            {value > 50 ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold font-mono">
                                {predictedHealth.toFixed(0)}/100
                            </span>
                            {value > 50 ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-sm italic text-foreground/80">
                        {value < 30 && "\"In 5 years, you will likely be in the same financial spot.\""}
                        {value >= 30 && value < 70 && "\"Small steps. You're maintaining, but not compounding.\""}
                        {value >= 70 && "\"In 5 years, the compound effect will have transformed your life.\""}
                    </p>
                </div>
            </div>
        </div>
    );
}
