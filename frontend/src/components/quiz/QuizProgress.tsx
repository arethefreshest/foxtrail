import React from 'react';
import { Steps } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

interface QuizProgressProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: Record<string, string>;
  questions: Array<{
    question: string;
    correct_answer: string;
  }>;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  totalQuestions,
  currentQuestion,
  answers,
  questions,
}) => {
  return (
    <Steps
      current={currentQuestion}
      className="mb-6"
      items={questions.map((q, index) => {
        const userAnswer = answers[q.question];
        const isAnswered = !!userAnswer;
        const isCorrect = userAnswer === q.correct_answer;

        return {
          title: `Q${index + 1}`,
          status: isAnswered 
            ? (isCorrect ? 'finish' : 'error')
            : (index === currentQuestion ? 'process' : 'wait'),
          icon: isAnswered 
            ? (isCorrect ? <CheckCircleFilled /> : <CloseCircleFilled />)
            : undefined,
        };
      })}
    />
  );
}; 