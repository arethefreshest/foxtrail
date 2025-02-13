import React from 'react';
import { Card, Progress, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Recommendation } from '../../types/recommendation';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick: (id: number) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation,
  onClick 
}) => {
  const confidencePercent = Math.round(recommendation.confidence * 100);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="recommendation-card"
    >
      <Card
        onClick={() => onClick(recommendation.contentId)}
        className="cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 
                   border-2 border-blue-200 hover:border-blue-300"
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold bg-clip-text text-transparent 
                         bg-gradient-to-r from-blue-600 to-purple-600">
            {recommendation.title}
          </h3>
          <div className="flex items-center gap-2">
            <Tag color={recommendation.type === 'nlp' ? 'blue' : 'purple'}>
              {recommendation.type}
            </Tag>
            <Tag color={
              recommendation.difficulty === 'beginner' ? 'green' :
              recommendation.difficulty === 'intermediate' ? 'blue' : 'purple'
            }>
              {recommendation.difficulty}
            </Tag>
          </div>
          <Progress 
            percent={confidencePercent} 
            size="small" 
            strokeColor={{ 
              '0%': '#818cf8', 
              '100%': '#8b5cf6' 
            }} 
          />
          <p className="text-sm text-gray-600">{recommendation.reason}</p>
        </div>
      </Card>
    </motion.div>
  );
}; 