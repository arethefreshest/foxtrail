import React from 'react';
import { useAchievementTracker } from '../hooks/useAchievementTracker';
import { useNLPRecommendations } from '../hooks/useNLPRecommendations';
import { AchievementList } from '../components/achievements/AchievementList';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, latestUnlock } = useAchievementTracker();
  const { user, loading: authLoading } = useAuth();
  const { recommendations, loading: recsLoading } = useNLPRecommendations(
    user?.id || 0,
    'beginner'
  );

  const handleRecommendationClick = (contentId: number) => {
    navigate(`/content/${contentId}`);
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 y2k-text-gradient">
          Your Learning Journey
        </h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 y2k-text-gradient">
            Achievements
          </h2>
          <AchievementList achievements={achievements} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 y2k-text-gradient">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(recommendation => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onClick={handleRecommendationClick}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}; 