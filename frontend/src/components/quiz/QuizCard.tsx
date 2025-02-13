import React, { useState } from 'react';
import { Button, Card, Space } from 'antd';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/sound';

interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation?: string;
}

interface QuizCardProps {
    question: QuizQuestion;
    onAnswer: (answer: string) => void;
    settings: {
        sound: boolean;
        volume: number;
        animations: boolean;
    };
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, settings }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const handleAnswer = (option: string) => {
        setSelectedAnswer(option);
        const isCorrect = option === question.correct_answer;
        
        // Play sound effect if enabled
        if (settings.sound) {
            if (isCorrect) {
                sounds.correct().setVolume(settings.volume);
            } else {
                sounds.incorrect().setVolume(settings.volume);
            }
        }

        // Delay the next question to show animation
        setTimeout(() => {
            onAnswer(option);
            setSelectedAnswer(null);
        }, 1000);
    };

    const animationProps = settings.animations ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.5 }
    } : {};

    return (
        <motion.div {...animationProps}>
            <Card className="quiz-card shadow-lg">
                <motion.h2 
                    className="text-xl font-bold mb-6"
                    {...(settings.animations ? {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { delay: 0.2 }
                    } : {})}
                >
                    {question.question}
                </motion.h2>
                <Space direction="vertical" className="w-full">
                    {question.options.map((option, index) => (
                        <motion.div
                            key={index}
                            {...(settings.animations ? {
                                initial: { x: -50, opacity: 0 },
                                animate: { x: 0, opacity: 1 },
                                transition: { delay: index * 0.1 }
                            } : {})}
                        >
                            <Button
                                className={`w-full text-left h-auto py-4 px-6 ${
                                    selectedAnswer === option 
                                        ? option === question.correct_answer
                                            ? 'bg-green-100 border-green-500'
                                            : 'bg-red-100 border-red-500'
                                        : 'hover:bg-blue-50'
                                }`}
                                onClick={() => !selectedAnswer && handleAnswer(option)}
                                disabled={!!selectedAnswer}
                            >
                                <span className="text-lg">{option}</span>
                            </Button>
                        </motion.div>
                    ))}
                </Space>
            </Card>
        </motion.div>
    );
}; 