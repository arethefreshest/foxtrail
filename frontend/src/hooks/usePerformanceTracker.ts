import { useLocalStorage } from './useLocalStorage';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface TopicPerformance {
  attempts: number;
  averageScore: number;
  lastDifficulty: Difficulty;
}

export const usePerformanceTracker = (topicId: string) => {
  const [performance, setPerformance] = useLocalStorage<Record<string, TopicPerformance>>(
    'topicPerformance',
    {}
  );

  const updatePerformance = (score: number, difficulty: Difficulty) => {
    setPerformance(prev => {
      const currentPerf = prev[topicId] || { attempts: 0, averageScore: 0, lastDifficulty: difficulty };
      return {
        ...prev,
        [topicId]: {
          attempts: currentPerf.attempts + 1,
          averageScore: (currentPerf.averageScore * currentPerf.attempts + score) / (currentPerf.attempts + 1),
          lastDifficulty: difficulty,
        },
      };
    });
  };

  const getRecommendedDifficulty = (): Difficulty => {
    const currentPerf = performance[topicId];
    if (!currentPerf || currentPerf.attempts < 2) return 'beginner';

    if (currentPerf.averageScore > 90) {
      return currentPerf.lastDifficulty === 'beginner' ? 'intermediate' : 'advanced';
    } else if (currentPerf.averageScore < 60) {
      return currentPerf.lastDifficulty === 'advanced' ? 'intermediate' : 'beginner';
    }

    return currentPerf.lastDifficulty;
  };

  return {
    updatePerformance,
    getRecommendedDifficulty,
    currentPerformance: performance[topicId],
  };
}; 