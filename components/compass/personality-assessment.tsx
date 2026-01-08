"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Heart,
    Zap,
    Users,
    Target,
    Coffee,
    Sparkles,
    CheckCircle2,
    Calendar,
    Lightbulb,
    Smile,
    Book,
    Music,
    Compass,
    TrendingUp,
    MessageCircle,
} from "lucide-react";

interface PersonalityAssessmentProps {
    onComplete: (result: {
        mbtiType: string;
        description: string;
        traits: any;
        responses: any;
    }) => void;
}

const MBTI_QUESTIONS = [
    {
        id: "energy_1",
        question: "After a long week, you recharge by... 🔋",
        dimension: "E/I",
        options: [
            {
                label: "Hitting up a party or social gathering",
                icon: Users,
                value: "E",
                points: 2,
            },
            {
                label: "Curling up alone with a good book",
                icon: Book,
                value: "I",
                points: 2,
            },
        ],
    },
    {
        id: "energy_2",
        question: "In group settings, you typically... 👥",
        dimension: "E/I",
        options: [
            {
                label: "Lead conversations and energize others",
                icon: Sparkles,
                value: "E",
                points: 2,
            },
            {
                label: "Listen more and contribute thoughtfully",
                icon: MessageCircle,
                value: "I",
                points: 2,
            },
        ],
    },
    {
        id: "perception_1",
        question: "When learning something new, you prefer... 📚",
        dimension: "S/N",
        options: [
            {
                label: "Hands-on practice and real examples",
                icon: Target,
                value: "S",
                points: 2,
            },
            {
                label: "Understanding theories and concepts first",
                icon: Brain,
                value: "N",
                points: 2,
            },
        ],
    },
    {
        id: "perception_2",
        question: "You're more interested in... 🌟",
        dimension: "S/N",
        options: [
            {
                label: "What is real and tangible right now",
                icon: CheckCircle2,
                value: "S",
                points: 2,
            },
            {
                label: "Future possibilities and patterns",
                icon: TrendingUp,
                value: "N",
                points: 2,
            },
        ],
    },
    {
        id: "decisions_1",
        question: "When making important decisions, you rely on... 🤔",
        dimension: "T/F",
        options: [
            {
                label: "Logic, facts, and objective analysis",
                icon: Brain,
                value: "T",
                points: 2,
            },
            {
                label: "Values, empathy, and how it affects people",
                icon: Heart,
                value: "F",
                points: 2,
            },
        ],
    },
    {
        id: "decisions_2",
        question: "In conflicts, you prioritize... ⚖️",
        dimension: "T/F",
        options: [
            {
                label: "Finding the truth and being fair",
                icon: Target,
                value: "T",
                points: 2,
            },
            {
                label: "Maintaining harmony and understanding feelings",
                icon: Heart,
                value: "F",
                points: 2,
            },
        ],
    },
    {
        id: "structure_1",
        question: "Your approach to deadlines is... ⏰",
        dimension: "J/P",
        options: [
            {
                label: "Plan ahead and finish early",
                icon: Calendar,
                value: "J",
                points: 2,
            },
            {
                label: "Work best under pressure, last-minute",
                icon: Zap,
                value: "P",
                points: 2,
            },
        ],
    },
    {
        id: "structure_2",
        question: "You prefer your day to be... 📅",
        dimension: "J/P",
        options: [
            {
                label: "Structured with a clear plan",
                icon: CheckCircle2,
                value: "J",
                points: 2,
            },
            {
                label: "Flexible and spontaneous",
                icon: Compass,
                value: "P",
                points: 2,
            },
        ],
    },
    {
        id: "energy_3",
        question: "At a party, you're more likely to... 🎉",
        dimension: "E/I",
        options: [
            {
                label: "Meet new people and work the room",
                icon: Users,
                value: "E",
                points: 1,
            },
            {
                label: "Stick with a few close friends",
                icon: Coffee,
                value: "I",
                points: 1,
            },
        ],
    },
    {
        id: "perception_3",
        question: "You're more drawn to... 💭",
        dimension: "S/N",
        options: [
            {
                label: "Practical, proven solutions",
                icon: CheckCircle2,
                value: "S",
                points: 1,
            },
            {
                label: "Innovative, creative ideas",
                icon: Lightbulb,
                value: "N",
                points: 1,
            },
        ],
    },
    {
        id: "decisions_3",
        question: "You'd rather be seen as... 🌟",
        dimension: "T/F",
        options: [
            {
                label: "Competent and capable",
                icon: Target,
                value: "T",
                points: 1,
            },
            {
                label: "Caring and compassionate",
                icon: Heart,
                value: "F",
                points: 1,
            },
        ],
    },
    {
        id: "structure_3",
        question: "Your workspace is typically... 🗂️",
        dimension: "J/P",
        options: [
            {
                label: "Organized and tidy",
                icon: CheckCircle2,
                value: "J",
                points: 1,
            },
            {
                label: "Creative chaos that makes sense to you",
                icon: Sparkles,
                value: "P",
                points: 1,
            },
        ],
    },
];

export function PersonalityAssessment({ onComplete }: PersonalityAssessmentProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isCalculating, setIsCalculating] = useState(false);

    const handleAnswer = (value: string, points: number) => {
        const question = MBTI_QUESTIONS[currentStep];
        const newAnswers = { ...answers, [question.id]: value };
        setAnswers(newAnswers);

        if (currentStep < MBTI_QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
            }, 300);
        } else {
            // Calculate MBTI type
            setIsCalculating(true);
            setTimeout(() => {
                const result = calculateMBTI(newAnswers);
                onComplete(result);
            }, 1500);
        }
    };

    const calculateMBTI = (responses: Record<string, string>) => {
        const scores = {
            E: 0,
            I: 0,
            S: 0,
            N: 0,
            T: 0,
            F: 0,
            J: 0,
            P: 0,
        };

        // Tally scores
        MBTI_QUESTIONS.forEach((q) => {
            const answer = responses[q.id];
            if (answer) {
                const option = q.options.find((opt) => opt.value === answer);
                if (option) {
                    scores[answer as keyof typeof scores] += option.points;
                }
            }
        });

        // Determine type
        const type =
            (scores.E > scores.I ? "E" : "I") +
            (scores.S > scores.N ? "S" : "N") +
            (scores.T > scores.F ? "T" : "F") +
            (scores.J > scores.P ? "J" : "P");

        const typeDescriptions: Record<string, { name: string; description: string }> = {
            INTJ: {
                name: "The Architect",
                description:
                    "Strategic, analytical, and independent. You see the big picture and plan meticulously to achieve your vision.",
            },
            INTP: {
                name: "The Logician",
                description:
                    "Innovative, curious, and theoretical. You love exploring ideas and understanding complex systems.",
            },
            ENTJ: {
                name: "The Commander",
                description:
                    "Bold, strategic, and decisive. You're a natural leader who excels at organizing people and resources.",
            },
            ENTP: {
                name: "The Debater",
                description:
                    "Quick-witted, innovative, and argumentative. You love intellectual challenges and brainstorming possibilities.",
            },
            INFJ: {
                name: "The Advocate",
                description:
                    "Insightful, principled, and idealistic. You're driven by deep values and a desire to help others.",
            },
            INFP: {
                name: "The Mediator",
                description:
                    "Empathetic, creative, and idealistic. You seek meaning and authenticity in everything you do.",
            },
            ENFJ: {
                name: "The Protagonist",
                description:
                    "Charismatic, inspiring, and altruistic. You're a natural leader who brings out the best in others.",
            },
            ENFP: {
                name: "The Campaigner",
                description:
                    "Enthusiastic, creative, and sociable. You see life as full of possibilities and inspire others with your energy.",
            },
            ISTJ: {
                name: "The Logistician",
                description:
                    "Practical, reliable, and detail-oriented. You value tradition and take responsibility seriously.",
            },
            ISFJ: {
                name: "The Defender",
                description:
                    "Caring, loyal, and meticulous. You're dedicated to protecting and supporting those you care about.",
            },
            ESTJ: {
                name: "The Executive",
                description:
                    "Organized, practical, and decisive. You excel at managing projects and bringing order to chaos.",
            },
            ESFJ: {
                name: "The Consul",
                description:
                    "Warm, conscientious, and cooperative. You thrive on helping others and creating harmony.",
            },
            ISTP: {
                name: "The Virtuoso",
                description:
                    "Bold, practical, and experimental. You're a hands-on problem solver who loves understanding how things work.",
            },
            ISFP: {
                name: "The Adventurer",
                description:
                    "Flexible, charming, and artistic. You live in the moment and express yourself through creativity.",
            },
            ESTP: {
                name: "The Entrepreneur",
                description:
                    "Energetic, perceptive, and action-oriented. You thrive on excitement and live life to the fullest.",
            },
            ESFP: {
                name: "The Entertainer",
                description:
                    "Spontaneous, enthusiastic, and playful. You love being the center of attention and making others happy.",
            },
        };

        const typeInfo = typeDescriptions[type] || {
            name: "The Explorer",
            description: "A unique blend of traits that makes you wonderfully complex.",
        };

        return {
            mbtiType: `${type} - ${typeInfo.name}`,
            description: typeInfo.description,
            traits: {
                energy: scores.E > scores.I ? "Extroverted" : "Introverted",
                perception: scores.S > scores.N ? "Sensing" : "Intuitive",
                decisions: scores.T > scores.F ? "Thinking" : "Feeling",
                structure: scores.J > scores.P ? "Judging" : "Perceiving",
                scores,
            },
            responses,
        };
    };

    const question = MBTI_QUESTIONS[currentStep];
    const progress = ((currentStep + 1) / MBTI_QUESTIONS.length) * 100;

    if (isCalculating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                >
                    <Brain className="w-16 h-16 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Analyzing your personality...</h2>
                <p className="text-muted-foreground">This will just take a moment ✨</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 max-w-2xl w-full mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 w-full">
                <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    <span>
                        Question {currentStep + 1} of {MBTI_QUESTIONS.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center min-h-[80px] flex items-center justify-center">
                        {question.question}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {question.options.map((opt) => (
                            <motion.button
                                key={opt.label}
                                onClick={() => handleAnswer(opt.value, opt.points)}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-card border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group min-h-[160px]"
                            >
                                <opt.icon className="w-12 h-12 mb-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                <span className="font-semibold text-base md:text-lg text-center">
                                    {opt.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
