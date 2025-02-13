import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      try {
        setError(null);
        await onSearch(searchQuery);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Search failed. Please try again.');
      }
    }, 300),
    []
  );

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim()) {
            debouncedSearch(e.target.value);
          }
        }}
        className="search-input"
        placeholder="Search for topics..."
        disabled={isLoading}
      />
      {isLoading && <div className="search-loader" />}
      {error && <div className="search-error">{error}</div>}
    </div>
  );
}; 