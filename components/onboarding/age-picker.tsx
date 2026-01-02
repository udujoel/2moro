"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

interface AgePickerProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;

export function AgePicker({ value, onChange, min = 18, max = 99 }: AgePickerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    // generate range
    const ages = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    // Handle scroll to update value
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollTop = scrollRef.current.scrollTop;
            const index = Math.round(scrollTop / ITEM_HEIGHT);
            const newAge = ages[index];
            if (newAge && newAge !== value) {
                onChange(newAge);
            }
        }
    };

    // Initial scroll position
    useEffect(() => {
        if (scrollRef.current) {
            const index = ages.indexOf(value);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * ITEM_HEIGHT;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative h-[240px] w-32 overflow-hidden flex items-center justify-center">
            {/* Selection Highlight */}
            <div className="absolute h-[48px] w-full bg-primary/20 rounded-xl z-0 pointer-events-none" />

            <div
                ref={scrollRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[96px] z-10"
                onScroll={handleScroll}
                style={{ scrollBehavior: "smooth" }}
            >
                {ages.map((age) => (
                    <div
                        key={age}
                        className={`h-[48px] flex items-center justify-center snap-center transition-all duration-200 cursor-pointer ${age === value
                                ? "text-2xl font-bold text-primary scale-110"
                                : "text-lg text-muted-foreground/50 scale-90"
                            }`}
                        onClick={() => {
                            if (scrollRef.current) {
                                const index = ages.indexOf(age);
                                scrollRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
                            }
                        }}
                    >
                        {age}
                    </div>
                ))}
            </div>

            {/* Gradients for fade effect */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-card to-transparent pointer-events-none z-20" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent pointer-events-none z-20" />
        </div>
    );
}
