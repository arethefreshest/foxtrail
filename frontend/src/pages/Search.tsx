import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Spin, Card, List, Tag, message } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { searchTopics } from '../services/api';

interface SearchResult {
  existingContent: any[];
  generatedContent: any[];
  categories: string[];
}

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) {
      message.warning('Please enter a topic to learn about');
      return;
    }

    setLoading(true);
    try {
      const result = await searchTopics(query);
      setSearchResults(result);
      if (result.existingContent.length > 0 || result.generatedContent.length > 0) {
        const content = result.existingContent[0] || result.generatedContent[0];
        navigate('/learning-path', { 
          state: { 
            topic: query, 
            content,
            isGenerated: !result.existingContent.length
          } 
        });
      }
    } catch (error) {
      message.error('Failed to search topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          What would you like to learn today?
        </h1>
        
        <div className="flex gap-2 mb-8">
          <Input
            size="large"
            placeholder="Enter any topic (e.g., Python Programming, World History, Chemistry...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
          />
          <Button 
            type="primary" 
            size="large"
            onClick={handleSearch}
            loading={loading}
          >
            Learn
          </Button>
        </div>

        {loading && (
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">
              Generating personalized learning content...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 