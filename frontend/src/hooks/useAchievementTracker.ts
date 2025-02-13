import { useState, useEffect } from 'react';
import { getAchievements, unlockAchievement } from '../services/api';
import { Achievement } from '../types/achievement';

export const useAchievementTracker = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [latestUnlock, setLatestUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await getAchievements();
      setAchievements(data.achievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const checkAndUnlockAchievements = async (
    performance: { score: number; timeLeft: number; streak: number }
  ) => {
    const { score, timeLeft, streak } = performance;
    
    // Check score achievements
    if (score >= 90) await tryUnlockAchievement(1); // Perfect Score
    if (streak >= 3) await tryUnlockAchievement(2);  // Streak Master
    if (timeLeft > 20) await tryUnlockAchievement(3); // Speed Demon
  };

  const tryUnlockAchievement = async (achievementId: number) => {
    try {
      const unlockedAchievement = await unlockAchievement(achievementId);
      setLatestUnlock(unlockedAchievement);
      setAchievements(prev => [...prev, unlockedAchievement]);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  return { achievements, latestUnlock, checkAndUnlockAchievements };
}; 