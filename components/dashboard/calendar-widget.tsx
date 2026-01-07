"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function CalendarWidget() {
    const [currentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = currentDate.getDate();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Generate calendar grid
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today;
        days.push(
            <div
                key={day}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${isToday
                        ? "bg-primary text-primary-foreground font-bold shadow-md"
                        : "text-foreground/70 hover:bg-muted/50"
                    }`}
            >
                {day}
            </div>
        );
    }

    return (
        <div className="bg-secondary/20 rounded-2xl p-4 border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm">
                    {monthNames[month]} {year}
                </h4>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-muted rounded transition-colors opacity-50 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded transition-colors opacity-50 cursor-not-allowed">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div
                        key={day}
                        className="text-center text-[10px] font-medium text-muted-foreground uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
}
