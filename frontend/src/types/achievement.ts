export type AchievementType = 'streak' | 'score' | 'speed';

export interface Achievement {
  id: number;
  type: AchievementType;
  title: string;
  description: string;
  criteria: {
    type: string;
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserAchievement {
  userId: number;
  achievements: Achievement[];
  totalUnlocked: number;
} 