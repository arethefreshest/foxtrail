export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Recommendation {
  id: number;
  contentId: number;
  title: string;
  difficulty: Difficulty;
  confidence: number;
  reason: string;
  type: 'nlp' | 'collaborative' | 'prerequisite';
}

export interface DifficultyRecommendation {
  currentDifficulty: Difficulty;
  recommendedDifficulty: Difficulty;
  confidence: number;
  reason: string;
} 