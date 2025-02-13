import React, { useEffect, useState } from 'react';
import { Progress } from 'antd';
import { motion } from 'framer-motion';

interface QuizTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        // Set warning when 5 seconds remaining
        if (prev <= 5) {
          setIsWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration);
    setIsWarning(false);
  }, [duration]);

  const percentage = (timeLeft / duration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Progress
        type="circle"
        percent={percentage}
        format={() => `${timeLeft}s`}
        status={isWarning ? "exception" : "active"}
        size="small"
        className={isWarning ? "animate-pulse" : ""}
      />
    </motion.div>
  );
}; 