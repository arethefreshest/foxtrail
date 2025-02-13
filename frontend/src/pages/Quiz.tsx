import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Progress, Button, message } from 'antd';
import { QuizCard } from '../components/quiz/QuizCard';
import { QuizSettings } from '../components/quiz/QuizSettings';
import { QuizTimer } from '../components/quiz/QuizTimer';
import { getQuiz, submitQuiz } from '../services/api';
import { CheckCircleOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AchievementPopup } from '../components/achievements/AchievementPopup';
import { useAchievements } from '../hooks/useAchievements';
import { QuizReview } from '../components/quiz/QuizReview';
import { StreakIndicator } from '../components/quiz/StreakIndicator';
import { DifficultySelector } from '../components/quiz/DifficultySelector';
import { usePerformanceTracker } from '../hooks/usePerformanceTracker';
import { QuizProgress } from '../components/quiz/QuizProgress';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

const Quiz: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { progress, currentAchievement, updateProgress } = useAchievements();
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [showReview, setShowReview] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const { updatePerformance, getRecommendedDifficulty } = usePerformanceTracker(contentId || '');
  
  // Use localStorage for settings
  const [settings, setSettings] = useLocalStorage('quizSettings', {
    sound: true,
    volume: 70,
    animations: true,
    showTimer: true,
    timePerQuestion: 30, // seconds
  });

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTimeUp = () => {
    // Auto-submit current question with no answer
    handleAnswer('');
  };

  const handleAnswer = async (answer: string) => {
    const updatedAnswers = {
      ...answers,
      [questions[currentQuestion].question]: answer
    };
    setAnswers(updatedAnswers);

    if (currentQuestion === questions.length - 1) {
      try {
        const result = await submitQuiz(Number(contentId), updatedAnswers);
        setScore(result.score);
        updateProgress(result.score, timeLeft);
        setShowResult(true);
      } catch (error) {
        message.error('Failed to submit quiz');
      }
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (contentId) {
      loadQuiz();
    }
  }, [contentId, difficulty]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await getQuiz(Number(contentId), difficulty);
      setQuestions(quizData.questions);
      setLoading(false);
    } catch (error) {
      message.error('Failed to load quiz');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Progress type="circle" status="active" percent={100} />
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <AchievementPopup achievement={currentAchievement} />
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <div className="text-center mb-6">
              {score >= 70 ? (
                <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              ) : (
                <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-4">
                Quiz Complete!
              </h2>
              <Progress
                type="circle"
                percent={score}
                status={score >= 70 ? "success" : "exception"}
                className="mb-6"
              />
              <p className="text-lg mb-6">
                {score >= 70 
                  ? "Great job! You've mastered this topic!" 
                  : "Keep practicing! You'll get it next time!"}
              </p>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => setShowReview(true)}
                className="mb-4"
              >
                Review Answers
              </Button>
            </div>
            
            {showReview && (
              <QuizReview
                questions={questions}
                userAnswers={answers}
                onRetry={() => window.location.reload()}
                onNext={() => navigate('/learning-path')}
              />
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <AchievementPopup achievement={currentAchievement} />
      <div className="max-w-2xl mx-auto">
        <Button
          icon={<SettingOutlined />}
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4"
        >
          Settings
        </Button>

        {!showResult && !loading && settings.showTimer && (
          <div className="flex justify-center mb-4">
            <QuizTimer
              duration={settings.timePerQuestion}
              onTimeUp={handleTimeUp}
              isActive={!showResult}
            />
          </div>
        )}

        {!loading && !showResult && questions.length > 0 && (
          <QuizProgress
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answers={answers}
            questions={questions}
          />
        )}

        {!loading && !showResult && (
          <QuizCard
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            settings={settings}
          />
        )}

        <QuizSettings
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingChange={handleSettingChange}
        />
      </div>
    </div>
  );
};

export default Quiz; 