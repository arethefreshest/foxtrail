import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge } from 'antd';
import { TrophyOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';

interface AchievementPopupProps {
  achievement: {
    type: 'streak' | 'score' | 'speed';
    title: string;
    description: string;
  } | null;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement }) => {
  if (!achievement) return null;

  const icons = {
    streak: <FireOutlined style={{ color: '#ff4d4f' }} />,
    score: <TrophyOutlined style={{ color: '#faad14' }} />,
    speed: <StarOutlined style={{ color: '#52c41a' }} />,
  };

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50"
        >
          <Badge.Ribbon text="Achievement Unlocked!" color="gold">
            <Card size="small" className="w-64 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{icons[achievement.type]}</div>
                <div>
                  <h4 className="m-0 font-bold">{achievement.title}</h4>
                  <p className="m-0 text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
            </Card>
          </Badge.Ribbon>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 