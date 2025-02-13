import { useState, useEffect } from 'react';
import { getDifficultyRecommendation } from '../services/api';
import { Difficulty, DifficultyRecommendation } from '../types/recommendation';
import { usePerformanceTracker } from './usePerformanceTracker';

export const useDifficultyFilter = (categoryId: number, contentId: string) => {
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('beginner');
  const [recommendation, setRecommendation] = useState<DifficultyRecommendation | null>(null);
  const { currentPerformance, getRecommendedDifficulty } = usePerformanceTracker(contentId);

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        const data = await getDifficultyRecommendation(categoryId);
        setRecommendation(data);
        
        // Compare with local performance data
        const localRecommendation = getRecommendedDifficulty();
        setCurrentDifficulty(
          data.confidence > 0.8 ? data.recommendedDifficulty : localRecommendation
        );
      } catch (error) {
        console.error('Error loading difficulty recommendation:', error);
        setCurrentDifficulty(getRecommendedDifficulty());
      }
    };

    loadRecommendation();
  }, [categoryId, contentId]);

  return {
    currentDifficulty,
    recommendation,
    setDifficulty: setCurrentDifficulty
  };
}; 