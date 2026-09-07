import { useMemo } from 'react';
import { generateOrganicPath } from '../utils/pathGenerator';
import { getNodeDimensions } from '../utils/canvasPlacement';

export function useOrganicLinkages(nodes = [], edges = [], measuredDims = {}) {
  const calculatedEdges = useMemo(() => {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) return [];
    
    const nodeMap = new Map();
    nodes.forEach((n) => {
      if (n && n.id) nodeMap.set(n.id, n);
    });

    return edges
      .map((edge) => {
        if (!edge || !edge.source || !edge.target) return null;
        
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode || sourceNode.hidden || targetNode.hidden) {
          return null;
        }

        const sPos = sourceNode.position || { x: 0, y: 0 };
        const tPos = targetNode.position || { x: 0, y: 0 };

        const sDims = (measuredDims && measuredDims[sourceNode.id]) || getNodeDimensions(sourceNode);
        const tDims = (measuredDims && measuredDims[targetNode.id]) || getNodeDimensions(targetNode);

        const startPoint = {
          x: (typeof sPos.x === 'number' && !isNaN(sPos.x) ? sPos.x : 0) + sDims.width / 2,
          y: (typeof sPos.y === 'number' && !isNaN(sPos.y) ? sPos.y : 0) + sDims.height / 2,
        };

        const endPoint = {
          x: (typeof tPos.x === 'number' && !isNaN(tPos.x) ? tPos.x : 0) + tDims.width / 2,
          y: (typeof tPos.y === 'number' && !isNaN(tPos.y) ? tPos.y : 0) + tDims.height / 2,
        };

        const isArrowed = edge.style === 'arrowed';
        const { d, midpoint } = generateOrganicPath(
          startPoint,
          endPoint,
          edge.relationshipType,
          tDims,
          isArrowed
        );

        return {
          ...edge,
          d,
          midpoint,
        };
      })
      .filter(Boolean);
  }, [nodes, edges, measuredDims]);

  return { calculatedEdges };
}
