# Project Structure Documentation

## Frontend Structure

### Core Components
- `components/achievements/`
  - `AchievementList.tsx`: Displays grid of user achievements with Y2K styling
  - `AchievementPopup.tsx`: Shows achievement notifications

- `components/quiz/`
  - `QuizCard.tsx`: Main quiz interface
  - `QuizTimer.tsx`: Countdown timer with visual feedback
  - `QuizProgress.tsx`: Shows progress through quiz questions
  - `QuizReview.tsx`: End-of-quiz review interface
  - `QuizSettings.tsx`: Quiz configuration modal
  - `StreakIndicator.tsx`: Visual indicator for answer streaks
  - `DifficultySelector.tsx`: Difficulty level selection

### Hooks
- `useAchievementTracker.ts`: Manages achievement unlocking and tracking
- `useAchievements.ts`: Handles user progress and achievement checks
- `useDifficultyFilter.ts`: Controls content difficulty progression
- `useNLPRecommendations.ts`: Manages NLP-based content recommendations
- `usePerformanceTracker.ts`: Tracks user performance metrics
- `usePreventLeave.ts`: Prevents accidental quiz abandonment

### Pages
- `Dashboard.tsx`: Main user dashboard with achievements and recommendations
- `LearningPath.tsx`: Visual learning path interface
- `Quiz.tsx`: Interactive quiz interface
- `Search.tsx`: Content search interface

## Backend Structure

### API Endpoints
- `api/endpoints/`
  - `auth.py`: Authentication endpoints
  - `content.py`: Content management
  - `learning_paths.py`: Learning path operations
  - `quiz.py`: Quiz operations

### Services
- `services/`
  - `ai_service.py`: AI-powered content generation
  - `cache_manager.py`: Caching system
  - `difficulty_service.py`: Difficulty progression logic
  - `learning_path_service.py`: Learning path management
  - `nlp_recommendation_service.py`: NLP-based recommendations
  - `recommendation_service.py`: General recommendation system

### Models
- `models/`
  - `category.py`: Content categorization
  - `content.py`: Learning content
  - `learning_path.py`: Learning paths
  - `prerequisites.py`: Content prerequisites
  - `quiz.py`: Quiz structure
  - `user_progress.py`: User progress tracking 