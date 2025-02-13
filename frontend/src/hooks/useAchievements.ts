import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface Achievement {
  type: 'streak' | 'score' | 'speed';
  title: string;
  description: string;
}

interface UserProgress {
  streak: number;
  totalQuizzes: number;
  averageScore: number;
  achievements: Achievement[];
}

export const useAchievements = () => {
  const [progress, setProgress] = useLocalStorage<UserProgress>('userProgress', {
    streak: 0,
    totalQuizzes: 0,
    averageScore: 0,
    achievements: [],
  });
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const checkAchievements = (score: number, timeLeft: number) => {
    const newAchievements: Achievement[] = [];

    // Check streak achievements
    if (progress.streak === 3) {
      newAchievements.push({
        type: 'streak',
        title: 'On Fire!',
        description: '3 quizzes completed in a row!',
      });
    }

    // Check score achievements
    if (score >= 90) {
      newAchievements.push({
        type: 'score',
        title: 'Excellence',
        description: 'Scored 90% or higher!',
      });
    }

    // Check speed achievements
    if (timeLeft > 15) {
      newAchievements.push({
        type: 'speed',
        title: 'Speed Demon',
        description: 'Completed with plenty of time to spare!',
      });
    }

    // Update progress and show achievement
    if (newAchievements.length > 0) {
      setProgress(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
      }));
      setCurrentAchievement(newAchievements[0]);
      setTimeout(() => setCurrentAchievement(null), 3000);
    }
  };

  const updateProgress = (score: number, timeLeft: number) => {
    setProgress(prev => ({
      ...prev,
      streak: score >= 70 ? prev.streak + 1 : 0,
      totalQuizzes: prev.totalQuizzes + 1,
      averageScore: (prev.averageScore * prev.totalQuizzes + score) / (prev.totalQuizzes + 1),
    }));
    checkAchievements(score, timeLeft);
  };

  return {
    progress,
    currentAchievement,
    updateProgress,
  };
}; 