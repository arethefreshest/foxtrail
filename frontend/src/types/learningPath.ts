export interface LearningPathNode {
  id: number;
  title: string;
  difficulty: string;
  completed: boolean;
  score?: number;
  recommendation_type?: 'prerequisite' | 'nlp';
  confidence?: number;
  reason?: string;
}

export interface LearningPathEdge {
  from: number;
  to: number;
  type: string;
}

export interface LearningPathData {
  nodes: LearningPathNode[];
  edges: LearningPathEdge[];
  recommended_next: LearningPathNode[];
} 