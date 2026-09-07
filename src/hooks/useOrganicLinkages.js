import { useMemo } from 'react';
import { generateOrganicPath } from '../utils/pathGenerator';
import { getNodeDimensions } from '../utils/canvasPlacement';

export function useOrganicLinkages(nodes = [], edges = [], measuredDims = {}, clusters = []) {
  const calculatedEdges = useMemo(() => {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) return [];

    const nodeMap = new Map();
    nodes.forEach((n) => {
      if (n && n.id) nodeMap.set(n.id, n);
    });

    // Map each child node ID to its collapsed cluster (if collapsed)
    const collapsedClusterByNodeId = new Map();
    const macroNodeByClusterId = new Map();

    if (Array.isArray(clusters)) {
      clusters.forEach((cluster) => {
        if (cluster && cluster.isCollapsed && Array.isArray(cluster.nodeIds)) {
          const childNodes = cluster.nodeIds.map((id) => nodeMap.get(id)).filter(Boolean);
          if (childNodes.length > 0) {
            let sx = 0,
              sy = 0;
            childNodes.forEach((cn) => {
              sx += (cn.position?.x ?? 0) + (cn.width || 280) / 2;
              sy += (cn.position?.y ?? 0) + (cn.height || 220) / 2;
            });
            const cx = Math.round(sx / childNodes.length);
            const cy = Math.round(sy / childNodes.length);

            // Represent Macro-Node centered around this centroid
            const macroWidth = 330;
            const macroHeight = 240;
            const macroNode = {
              id: `macro-${cluster.id}`,
              position: { x: cx - macroWidth / 2, y: cy - macroHeight / 2 },
              width: macroWidth,
              height: macroHeight,
              hidden: false,
            };

            macroNodeByClusterId.set(cluster.id, macroNode);
            cluster.nodeIds.forEach((nid) => {
              collapsedClusterByNodeId.set(nid, cluster);
            });
          }
        }
      });
    }

    return edges
      .map((edge) => {
        if (!edge || !edge.source || !edge.target) return null;

        const sourceCluster = collapsedClusterByNodeId.get(edge.source);
        const targetCluster = collapsedClusterByNodeId.get(edge.target);

        // If both source and target are inside the SAME collapsed cluster, hide the internal edge
        if (sourceCluster && targetCluster && sourceCluster.id === targetCluster.id) {
          return null;
        }

        // Retarget endpoints if inside a collapsed cluster
        let effectiveSourceNode = nodeMap.get(edge.source);
        let effectiveTargetNode = nodeMap.get(edge.target);

        if (sourceCluster) {
          effectiveSourceNode = macroNodeByClusterId.get(sourceCluster.id);
        }
        if (targetCluster) {
          effectiveTargetNode = macroNodeByClusterId.get(targetCluster.id);
        }

        if (
          !effectiveSourceNode ||
          !effectiveTargetNode ||
          effectiveSourceNode.hidden ||
          effectiveTargetNode.hidden
        ) {
          return null;
        }

        const sPos = effectiveSourceNode.position || { x: 0, y: 0 };
        const tPos = effectiveTargetNode.position || { x: 0, y: 0 };

        const sDims =
          (measuredDims && measuredDims[effectiveSourceNode.id]) ||
          getNodeDimensions(effectiveSourceNode);
        const tDims =
          (measuredDims && measuredDims[effectiveTargetNode.id]) ||
          getNodeDimensions(effectiveTargetNode);

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
  }, [nodes, edges, measuredDims, clusters]);

  return { calculatedEdges };
}
