import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FireOutlined } from '@ant-design/icons';

interface StreakIndicatorProps {
  streak: number;
  isVisible: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-2">
            <FireOutlined className="text-xl animate-pulse" />
            <span className="font-bold">{streak}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 