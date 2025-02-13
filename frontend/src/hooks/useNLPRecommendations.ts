import { useState, useEffect } from 'react';
import { getNLPRecommendations } from '../services/api';
import { Recommendation } from '../types/recommendation';

export const useNLPRecommendations = (userId: number, difficulty?: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getNLPRecommendations(userId, difficulty);
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading NLP recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [userId, difficulty]);

  return { recommendations, loading, refreshRecommendations: loadRecommendations };
}; 