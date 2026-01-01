"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

interface PersonalityQuizProps {
    onComplete: (data: any) => void;
}

const QUESTIONS = [
    {
        id: 1,
        question: "Pick the office you'd rather work in",
        options: [
            { id: "a", label: "Minimalist & Quiet", vibe: "Architect" },
            { id: "b", label: "Collaborative & Busy", vibe: "Connector" },
        ],
    },
    {
        id: 2,
        question: "A free Saturday looks like...",
        options: [
            { id: "a", label: "Hiking a mountain", vibe: "Explorer" },
            { id: "b", label: "Reading in bed", vibe: "Thinker" },
        ],
    },
    // Add more questions as needed
];

export function PersonalityQuiz({ onComplete }: PersonalityQuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);

    const handleAnswer = (option: any) => {
        const newAnswers = [...answers, option];
        setAnswers(newAnswers);

        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Analyze results mock
            onComplete({
                archetype: "The " + option.vibe, // Simplistic logic for MVP
                mbti: "INTJ" // Mock
            });
        }
    };

    const question = QUESTIONS[currentQuestion];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-lg mx-auto"
        >
            <div className="w-full space-y-8">
                <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-4">
                    <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                    <span>Vibe Check</span>
                </div>

                <h2 className="text-3xl font-bold mb-8 leading-tight">{question.question}</h2>

                <div className="grid grid-cols-1 gap-4">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleAnswer(option)}
                            className="group flex items-center justify-between p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                        >
                            <span className="text-lg font-medium group-hover:text-primary transition-colors">{option.label}</span>
                            <ArrowRight className="w-5 h-5 text-transparent group-hover:text-primary transition-colors -translate-x-2 group-hover:translate-x-0" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
