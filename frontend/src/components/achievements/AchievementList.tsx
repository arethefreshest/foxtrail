import React from 'react';
import { motion } from 'framer-motion';
import { Badge, Card } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { Achievement } from '../../types/achievement';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="achievement-card"
        >
          <Card 
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 
                       hover:border-purple-300 transition-all duration-300"
          >
            <Badge.Ribbon 
              text={achievement.type} 
              color={achievement.unlocked ? 'gold' : 'default'}
            >
              <div className="flex items-center gap-3">
                <TrophyOutlined className="text-2xl text-purple-500" />
                <div>
                  <h4 className="m-0 font-bold bg-clip-text text-transparent 
                               bg-gradient-to-r from-purple-600 to-pink-600">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              </div>
            </Badge.Ribbon>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}; 