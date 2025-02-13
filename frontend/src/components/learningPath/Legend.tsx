import React from 'react';

const Legend: React.FC = () => {
  const items = [
    { color: 'bg-green-500', label: 'Completed' },
    { color: 'bg-blue-500', label: 'AI Recommended' },
    { color: 'bg-indigo-500', label: 'Available' },
  ];

  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
      <div className="flex flex-col gap-2">
        {items.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${color}`} />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
