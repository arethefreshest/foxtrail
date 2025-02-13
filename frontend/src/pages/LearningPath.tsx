import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Divider, message, Spin } from 'antd';
import { BookOutlined, CheckCircleOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface LearningContent {
  title: string;
  content: string;
  id?: number;
}

const LearningPath: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { topic, content } = location.state as { topic: string; content: LearningContent };

  const [loading, setLoading] = useState(location.state?.isGenerated || false);

  useEffect(() => {
    if (location.state?.isGenerated) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.isGenerated]);

  // Parse content sections (assuming content is formatted with numbered sections)
  const sections = content.content.split(/\d+\.\s+/).filter(Boolean);

  const startQuiz = () => {
    if (content.id) {
      navigate(`/quiz/${content.id}`);
    } else {
      message.error('Quiz not available for this content');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">
            Generating your personalized learning content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 shadow-lg">
          <div className="flex items-center mb-4">
            <BookOutlined className="text-2xl text-blue-500 mr-3" />
            <Title level={2} className="m-0">
              {content.title}
            </Title>
          </div>
          
          {sections.map((section, index) => (
            <div key={index} className="mb-6">
              <Card 
                className="bg-white shadow hover:shadow-md transition-shadow"
                bordered={false}
              >
                <Paragraph className="text-lg">
                  {section.trim()}
                </Paragraph>
                
                {index < sections.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <RightOutlined className="text-gray-400" />
                  </div>
                )}
              </Card>
            </div>
          ))}

          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text type="secondary">
                Ready to test your knowledge?
              </Text>
            </div>
            <Button 
              type="primary" 
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={startQuiz}
            >
              Take Quiz
            </Button>
          </div>
        </Card>

        <div className="text-center">
          <Button 
            type="link"
            onClick={() => navigate('/')}
          >
            Search Another Topic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningPath; 