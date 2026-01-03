"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Coffee, Map, Heart, Brain, Smile, Meh, CheckCircle2 } from "lucide-react";

interface PersonalityQuizProps {
    onComplete: (data: any) => void;
}

const QUESTIONS = [
    {
        id: "energy",
        question: "Recharging your batteries looks like...",
        options: [
            { label: "Crowded House Party", icon: Zap, value: "Extrovert" },
            { label: "Solo Cozy Night", icon: Coffee, value: "Introvert" }
        ]
    },
    {
        id: "perception",
        question: "When learning something new...",
        options: [
            { label: "Theory & Concepts", icon: Brain, value: "Intuitive" },
            { label: "Facts & Hands-on", icon: Map, value: "Sensing" }
        ]
    },
    {
        id: "decisions",
        question: "In a heated argument, you value...",
        options: [
            { label: "Logic & Truth", icon: Brain, value: "Thinking" },
            { label: "Harmony & Feelings", icon: Heart, value: "Feeling" }
        ]
    },
    {
        id: "structure",
        question: "Your approach to deadlines...",
        options: [
            { label: "Done Early & Planned", icon: CheckCircle2, value: "Judging" },
            { label: "Panic & Inspiration", icon: Zap, value: "Perceiving" }
        ]
    }
];

export function PersonalityQuiz({ onComplete }: PersonalityQuizProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleAnswer = (value: string) => {
        const question = QUESTIONS[currentStep];
        const newAnswers = { ...answers, [question.id]: value };
        setAnswers(newAnswers);

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finished
            onComplete({ quizResult: newAnswers });
        }
    };

    const question = QUESTIONS[currentStep];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={currentStep} // Animate between steps
            className="flex flex-col items-center justify-center p-8 max-w-md w-full text-center"
        >
            <div className="mb-8 w-full max-w-xs">
                <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    <span>Question {currentStep + 1}</span>
                    <span>{QUESTIONS.length} Total</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-12 min-h-[80px] flex items-center justify-center">{question.question}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {question.options.map((opt) => (
                    <button
                        key={opt.label}
                        onClick={() => handleAnswer(opt.value)}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl bg-secondary/30 border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all group active:scale-95"
                    >
                        <opt.icon className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        <span className="font-semibold text-lg">{opt.label}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
