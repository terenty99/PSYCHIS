import { useMemo } from 'react';
import { generateOrganicPath } from '../utils/pathGenerator';

export function useOrganicLinkages(nodes, edges) {
  const calculatedEdges = useMemo(() => {
    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    return edges
      .map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode || sourceNode.hidden || targetNode.hidden) {
          return null;
        }

        const sWidth = sourceNode.width || 250;
        const sHeight = sourceNode.height || 180;
        const tWidth = targetNode.width || 250;
        const tHeight = targetNode.height || 180;

        const startPoint = {
          x: sourceNode.position.x + sWidth / 2,
          y: sourceNode.position.y + sHeight / 2,
        };

        const endPoint = {
          x: targetNode.position.x + tWidth / 2,
          y: targetNode.position.y + tHeight / 2,
        };

        const { d, midpoint } = generateOrganicPath(startPoint, endPoint, edge.relationshipType);

        return {
          ...edge,
          d,
          midpoint,
        };
      })
      .filter(Boolean);
  }, [nodes, edges]);

  return { calculatedEdges };
}
