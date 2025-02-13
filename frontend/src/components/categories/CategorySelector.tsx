import React from 'react';
import { Tree, Spin } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useCategories } from '../../hooks/useCategories';

interface CategorySelectorProps {
  onSelect: (categoryId: number) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect }) => {
  const { categories, loading } = useCategories();

  const convertToTreeData = (categories: any[]): DataNode[] => {
    return categories.map(cat => ({
      title: cat.name,
      key: cat.id,
      children: cat.subcategories ? convertToTreeData(cat.subcategories) : [],
    }));
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="category-selector">
      <Tree
        className="y2k-tree"
        treeData={convertToTreeData(categories)}
        onSelect={(_, { node }) => onSelect(node.key as number)}
      />
    </div>
  );
}; 