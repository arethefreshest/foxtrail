import React from 'react';
import { Radio, Card } from 'antd';
import { 
  BulbOutlined, 
  RocketOutlined, 
  ExperimentOutlined 
} from '@ant-design/icons';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  recommended?: Difficulty;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  recommended
}) => {
  return (
    <Card className="mb-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">Select Difficulty</h3>
        {recommended && (
          <p className="text-sm text-gray-600">
            Recommended: {recommended.charAt(0).toUpperCase() + recommended.slice(1)}
          </p>
        )}
      </div>
      <Radio.Group 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full"
      >
        <div className="grid grid-cols-3 gap-4">
          <Radio.Button value="beginner" className="text-center h-auto py-4">
            <BulbOutlined className="text-2xl block mb-2" />
            <div>Beginner</div>
          </Radio.Button>
          <Radio.Button value="intermediate" className="text-center h-auto py-4">
            <RocketOutlined className="text-2xl block mb-2" />
            <div>Intermediate</div>
          </Radio.Button>
          <Radio.Button value="advanced" className="text-center h-auto py-4">
            <ExperimentOutlined className="text-2xl block mb-2" />
            <div>Advanced</div>
          </Radio.Button>
        </div>
      </Radio.Group>
    </Card>
  );
}; 