import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LearningPathGraph from '../components/learningPath/LearningPathGraph';
import { fetchLearningPath } from '../services/api';
import { LearningPathData } from '../types/learningPath';

const LearningPathContainer: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pathData, setPathData] = useState<LearningPathData | null>(null);

  useEffect(() => {
    const loadLearningPath = async () => {
      try {
        setLoading(true);
        const data = await fetchLearningPath(parseInt(categoryId!, 10));
        setPathData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load learning path. Please try again later.');
        console.error('Error loading learning path:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadLearningPath();
    }
  }, [categoryId]);

  const handleNodeClick = (nodeId: number) => {
    navigate(`/content/${nodeId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="p-4">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
          No learning path data available.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <LearningPathGraph
        nodes={pathData.nodes}
        edges={pathData.edges}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
};

export default LearningPathContainer; 