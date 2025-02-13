import React from 'react';
import { Card, List, Tag, Button, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text, Paragraph } = Typography;

interface QuizReviewProps {
  questions: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation?: string;
  }>;
  userAnswers: Record<string, string>;
  onRetry: () => void;
  onNext: () => void;
}

export const QuizReview: React.FC<QuizReviewProps> = ({
  questions,
  userAnswers,
  onRetry,
  onNext,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <List
        dataSource={questions}
        renderItem={(question, index) => {
          const isCorrect = userAnswers[question.question] === question.correct_answer;
          return (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`mb-4 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}
                bordered
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircleOutlined className="text-green-500 text-xl mt-1" />
                  ) : (
                    <CloseCircleOutlined className="text-red-500 text-xl mt-1" />
                  )}
                  <div className="flex-1">
                    <Paragraph strong>{question.question}</Paragraph>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Text
                            className={`
                              ${option === question.correct_answer ? 'text-green-600' : ''}
                              ${option === userAnswers[question.question] && !isCorrect ? 'text-red-600' : ''}
                            `}
                          >
                            {option}
                          </Text>
                          {option === question.correct_answer && (
                            <Tag color="success">Correct Answer</Tag>
                          )}
                          {option === userAnswers[question.question] && !isCorrect && (
                            <Tag color="error">Your Answer</Tag>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <Paragraph className="mt-2 text-gray-600 bg-gray-50 p-2 rounded">
                        <Text strong>Explanation: </Text>
                        {question.explanation}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        }}
      />
      <div className="flex justify-between mt-6">
        <Button size="large" onClick={onRetry}>
          Try Again
        </Button>
        <Button type="primary" size="large" onClick={onNext}>
          Next Topic
        </Button>
      </div>
    </motion.div>
  );
}; 