import { useState } from 'react';
import { searchTopics } from '../services/api';

interface SearchResult {
  existingContent: any[];
  generatedContent: any[];
  categories: string[];
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await searchTopics(query);
      setResults(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, error, performSearch };
}; 