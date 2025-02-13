import React, { useEffect, useRef } from 'react';
import { Network, DataSet, Edge, Options } from 'vis-network/standalone';
import { LearningPathNode, LearningPathEdge } from '../../types/learningPath';
import Legend from './Legend';

interface LearningPathGraphProps {
  nodes: LearningPathNode[];
  edges: LearningPathEdge[];
  onNodeClick: (nodeId: number) => void;
}

const LearningPathGraph: React.FC<LearningPathGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const visNodes = new DataSet(
      nodes.map(node => ({
        id: node.id,
        label: node.title,
        color: {
          background: node.completed 
            ? 'rgb(34 197 94)' // green-500
            : node.recommendation_type === 'nlp'
              ? 'rgb(59 130 246)' // blue-500
              : 'rgb(99 102 241)', // indigo-500
          border: node.completed
            ? 'rgb(21 128 61)' // green-700
            : 'rgb(67 56 202)', // indigo-700
        },
        font: {
          color: '#1f2937', // gray-800
        },
        shape: 'box',
        borderWidth: 2,
        shadow: true,
        title: `
          Difficulty: ${node.difficulty}
          ${node.score ? `Score: ${node.score}` : ''}
          ${node.reason ? `\n${node.reason}` : ''}
        `,
      }))
    );

    const visEdges = new DataSet<Edge>(
      edges.map(edge => ({
        id: `${edge.from}-${edge.to}`,
        from: edge.from,
        to: edge.to,
        arrows: 'to',
        color: {
          color: '#6b7280', // gray-500
          opacity: 0.6,
        },
        smooth: {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.2,
        },
      }))
    );

    const options: Options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          levelSeparation: 200,
          nodeSpacing: 150,
        },
      },
      physics: {
        enabled: false,
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
    };

    networkRef.current = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      options
    );

    networkRef.current.on('click', (params: { nodes: number[] }) => {
      if (params.nodes.length > 0) {
        onNodeClick(params.nodes[0]);
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodes, edges, onNodeClick]);

  return (
    <div className="relative h-[600px] w-full">
      <div ref={containerRef} className="h-full w-full" />
      <Legend />
    </div>
  );
};

export default LearningPathGraph; 