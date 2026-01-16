"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getCalendarData, CalendarData } from "@/app/actions/dashboard";

export function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarData>({});
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Fetch calendar data when month changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getCalendarData(year, month);
                setCalendarData(data);
            } catch (e) {
                console.error("Failed to fetch calendar data:", e);
            }
        };
        fetchData();
    }, [year, month]);

    const navigateMonth = (direction: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const getDateKey = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleMouseEnter = (day: number, event: React.MouseEvent) => {
        const dateKey = getDateKey(day);
        if (calendarData[dateKey]) {
            setHoveredDay(day);
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
        }
    };

    const handleMouseLeave = () => {
        setHoveredDay(null);
    };

    // Generate calendar grid
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && day === today.getDate();
        const dateKey = getDateKey(day);
        const dayData = calendarData[dateKey];

        days.push(
            <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors relative cursor-pointer ${isToday
                    ? "bg-primary text-primary-foreground font-bold shadow-md"
                    : "text-foreground/70 hover:bg-muted/50"
                    }`}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={handleMouseLeave}
            >
                <span>{day}</span>
                {/* Activity dots */}
                {dayData && (
                    <div className="flex gap-0.5 mt-0.5">
                        {dayData.hasMemories && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Memories" />
                        )}
                        {dayData.hasHabits && (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Habits" />
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Get tooltip content for hovered day
    const getTooltipContent = () => {
        if (hoveredDay === null) return null;
        const dateKey = getDateKey(hoveredDay);
        const dayData = calendarData[dateKey];
        if (!dayData) return null;

        return (
            <div className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]"
                style={{
                    left: Math.min(tooltipPosition.x, window.innerWidth - 290),
                    top: tooltipPosition.y
                }}
            >
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                    {monthNames[month]} {hoveredDay}, {year}
                </div>
                <div className="space-y-1">
                    {dayData.memoryCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>{dayData.memoryCount} {dayData.memoryCount === 1 ? 'memory' : 'memories'}</span>
                        </div>
                    )}
                    {dayData.habitCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>{dayData.habitCount} {dayData.habitCount === 1 ? 'habit' : 'habits'} completed</span>
                        </div>
                    )}
                </div>
                {dayData.summaries.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        {dayData.summaries.map((summary, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground truncate">{summary}</p>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="bg-secondary/20 rounded-2xl p-4 border border-border">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm">
                        {monthNames[month]} {year}
                    </h4>
                    <div className="flex gap-1">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                        >
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

            {/* Tooltip Portal */}
            {hoveredDay !== null && getTooltipContent()}
        </>
    );
}
