"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { getSP500Data, formatCurrency } from "@/lib/finance";

interface PortfolioChartProps {
    userId: string;
}

export function PortfolioChart({ userId }: PortfolioChartProps) {
    const [data, setData] = useState<Array<{ date: string; value: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setIsLoading(true);
        // For now, always show S&P 500 data
        // In the future, this could check if user has stocks and show portfolio instead
        const marketData = await getSP500Data();
        setData(marketData);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-secondary rounded w-1/3"></div>
                    <div className="h-48 bg-secondary rounded"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No market data available</p>
            </div>
        );
    }

    const startValue = data[0].value;
    const endValue = data[data.length - 1].value;
    const change = endValue - startValue;
    const changePercent = ((change / startValue) * 100).toFixed(2);
    const isPositive = change >= 0;

    const minValue = Math.min(...data.map((d) => d.value));
    const maxValue = Math.max(...data.map((d) => d.value));
    const range = maxValue - minValue;

    // Calculate points for SVG path
    const width = 600;
    const height = 200;
    const padding = 20;

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding);
        return { x, y, value: d.value, date: d.date };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">S&P 500 Performance</h3>
                        <p className="text-sm text-muted-foreground">Last 12 months</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2">
                        {isPositive ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <span
                            className={`text-2xl font-bold ${isPositive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            {isPositive ? "+" : ""}
                            {changePercent}%
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {formatCurrency(endValue)}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto"
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {/* Grid lines */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop
                                offset="0%"
                                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                                stopOpacity="0.3"
                            />
                            <stop
                                offset="100%"
                                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    {/* Area under the line */}
                    <path
                        d={`${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding
                            } Z`}
                        fill="url(#chartGradient)"
                    />

                    {/* Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke={isPositive ? "#22c55e" : "#ef4444"}
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Interactive points */}
                    {points.map((point, i) => (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r={hoveredIndex === i ? 6 : 0}
                            fill={isPositive ? "#22c55e" : "#ef4444"}
                            onMouseEnter={() => setHoveredIndex(i)}
                            className="cursor-pointer transition-all"
                        />
                    ))}

                    {/* Invisible hover areas */}
                    {points.map((point, i) => (
                        <rect
                            key={`hover-${i}`}
                            x={point.x - 10}
                            y={0}
                            width={20}
                            height={height}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            className="cursor-pointer"
                        />
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredPoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100}%`,
                            transform: "translate(-50%, -120%)",
                        }}
                    >
                        <p className="font-semibold">{formatCurrency(hoveredPoint.value)}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(hoveredPoint.date).toLocaleDateString()}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(data[0].date).toLocaleDateString()}</span>
                <span>
                    {new Date(data[data.length - 1].date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
