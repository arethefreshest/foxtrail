import React from 'react';

interface DashboardProps {
    username: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ username }) => {
    return (
        <div className="dashboard">
            <h2>Welcome, {username}!</h2>
            <div className="dashboard-grid">
                <div className="progress-section">
                    <h3>Your Progress</h3>
                    {/* Progress bars will go here */}
                </div>
                <div className="categories-section">
                    <h3>Learning Categories</h3>
                    {/* Category list will go here */}
                </div>
                <div className="recent-quizzes">
                    <h3>Recent Quizzes</h3>
                    {/* Quiz list will go here */}
                </div>
            </div>
        </div>
    );
}; 