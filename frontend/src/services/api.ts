import axios, { InternalAxiosRequestConfig } from 'axios';
import { LearningPathData } from '../types/learningPath';
import { UserAchievement, Achievement } from '../types/achievement';
import { Recommendation, DifficultyRecommendation } from '../types/recommendation';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface SearchResult {
  existingContent: any[];
  generatedContent: any[];
  categories: string[];
}

export const searchTopics = async (query: string) => {
  try {
    const response = await axios.post(`${API_URL}/search`, {
      query,
      generateContent: true
    });
    console.log('Search response:', response.data);
    return {
      existingContent: response.data.existingContent,
      generatedContent: response.data.generatedContent,
      categories: response.data.categories
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getQuiz = async (contentId: number, difficulty?: string) => {
  try {
    const response = await apiClient.get(`/quiz/${contentId}`, {
      params: { 
        difficulty,
        generateQuestions: true // Enable AI question generation if none exist
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitQuiz = async (quizId: number, answers: Record<string, string>) => {
  const response = await apiClient.post(`/quiz/quizzes/${quizId}/submit`, { answers });
  return response.data;
};

export const getUserProgress = async () => {
  const response = await apiClient.get('/quiz/progress');
  return response.data;
};

export const fetchLearningPath = async (categoryId: number): Promise<LearningPathData> => {
  try {
    const response = await apiClient.get(`/learning-paths/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLearningPathProgress = async (categoryId: number, contentId: number) => {
  try {
    const response = await apiClient.post(`/learning-paths/${categoryId}/progress`, {
      content_id: contentId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const api = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },
};

// Achievement endpoints
export const getAchievements = async () => {
  try {
    const response = await apiClient.get('/achievements');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unlockAchievement = async (achievementId: number) => {
  try {
    const response = await apiClient.post(`/achievements/${achievementId}/unlock`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Recommendation endpoints
export const getRecommendations = async (userId: number) => {
  try {
    const response = await apiClient.get(`/recommendations/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDifficultyRecommendation = async (categoryId: number) => {
  try {
    const response = await apiClient.get(`/recommendations/difficulty/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// NLP-based recommendations with difficulty filtering
export const getNLPRecommendations = async (userId: number, difficulty?: string) => {
  try {
    const response = await apiClient.get(`/recommendations/${userId}/nlp`, {
      params: { difficulty }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 