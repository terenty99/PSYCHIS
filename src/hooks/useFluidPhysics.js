import { useCallback } from 'react';
import { getNodeDimensions } from '../utils/canvasPlacement';

/**
 * Hook to apply physical billiard collision impulses, constellation dragging repulsion,
 * and continuous subtle semantic gravitation between spatial nodes.
 */
export function useFluidPhysics() {
  /**
   * Resolves physical billiard collision and viscous repulsion when dragging nodes.
   * If a constellation of multiple selected nodes is moving, internal relative positions
   * remain rigid, while external obstacle nodes are gently pushed away.
   */
  const resolveFluidRepulsion = useCallback(
    (draggedIdOrIds, currentPosOrMap, allNodes, onNodeMove) => {
      if (!allNodes || allNodes.length === 0) return;

      const draggedSet = new Set(
        Array.isArray(draggedIdOrIds) ? draggedIdOrIds : [draggedIdOrIds]
      );

      const padding = 22; // Physical buffer between nodes

      // For each dragged node in the active constellation
      draggedSet.forEach((draggedId) => {
        const draggedNode = allNodes.find((n) => n.id === draggedId);
        if (!draggedNode) return;

        const currentPos =
          (currentPosOrMap && typeof currentPosOrMap.x === 'number'
            ? currentPosOrMap
            : currentPosOrMap?.[draggedId]) ||
          draggedNode.position || { x: 0, y: 0 };

        const dDims = getNodeDimensions(draggedNode);
        const dWidth = dDims.width;
        const dHeight = dDims.height;
        const dCenterX = currentPos.x + dWidth / 2;
        const dCenterY = currentPos.y + dHeight / 2;

        allNodes.forEach((other) => {
          // Do not repel other nodes in the same moving constellation or hidden nodes
          if (draggedSet.has(other.id) || other.hidden) return;

          const oDims = getNodeDimensions(other);
          const oWidth = oDims.width;
          const oHeight = oDims.height;
          const oCenterX = other.position.x + oWidth / 2;
          const oCenterY = other.position.y + oHeight / 2;

          // Distance between bounding box centers
          const dx = oCenterX - dCenterX;
          const dy = oCenterY - dCenterY;

          // Minimum allowed distance along bounding radii
          const minRadiusX = (dWidth + oWidth) / 2 + padding;
          const minRadiusY = (dHeight + oHeight) / 2 + padding;

          // Check for axis-aligned bounding box collision / proximity
          const overlapX = minRadiusX - Math.abs(dx);
          const overlapY = minRadiusY - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            // Push along the shallower axis or separation angle
            let pushX = 0;
            let pushY = 0;

            if (overlapX < overlapY) {
              pushX = Math.sign(dx || 1) * overlapX * 0.45;
            } else {
              pushY = Math.sign(dy || 1) * overlapY * 0.45;
            }

            // Soft radial impulse to prevent axis locking
            const radialForce = Math.min(overlapX, overlapY) * 0.15;
            const angle = Math.atan2(dy, dx);
            pushX += Math.cos(angle) * radialForce;
            pushY += Math.sin(angle) * radialForce;

            onNodeMove(other.id, {
              x: Math.round(other.position.x + pushX),
              y: Math.round(other.position.y + pushY),
            });
          }
        });
      });
    },
    []
  );

  /**
   * Continuous Semantic Gravitation Force:
   * Gently pulls nodes in the same cluster or high-affinity pair towards each other
   * when distances exceed comfortable reading span:
   * F_attract = 0.04 * clamp(d - 300, 0, 150)
   */
  const resolveSemanticGravitation = useCallback((nodes, clusters, onNodeMove) => {
    if (!Array.isArray(nodes) || !Array.isArray(clusters) || clusters.length === 0) return;

    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    clusters.forEach((cluster) => {
      if (cluster.isCollapsed || !Array.isArray(cluster.nodeIds) || cluster.nodeIds.length < 2) {
        return;
      }

      const clusterNodes = cluster.nodeIds.map((id) => nodeMap.get(id)).filter((n) => n && !n.hidden);
      if (clusterNodes.length < 2) return;

      // Compute cluster centroid
      let cx = 0,
        cy = 0;
      clusterNodes.forEach((n) => {
        const dims = getNodeDimensions(n);
        cx += n.position.x + dims.width / 2;
        cy += n.position.y + dims.height / 2;
      });
      cx /= clusterNodes.length;
      cy /= clusterNodes.length;

      clusterNodes.forEach((node) => {
        const dims = getNodeDimensions(node);
        const nodeCenterX = node.position.x + dims.width / 2;
        const nodeCenterY = node.position.y + dims.height / 2;

        const dx = cx - nodeCenterX;
        const dy = cy - nodeCenterY;
        const dist = Math.hypot(dx, dy) || 1;

        // Apply gentle attraction if distance from centroid is greater than 300px
        const excess = Math.max(0, Math.min(dist - 300, 150));
        if (excess > 0) {
          const force = 0.04 * excess;
          const pullX = (dx / dist) * force;
          const pullY = (dy / dist) * force;

          if (Math.hypot(pullX, pullY) > 0.1) {
            onNodeMove(node.id, {
              x: node.position.x + pullX,
              y: node.position.y + pullY,
            });
          }
        }
      });
    });
  }, []);

  return { resolveFluidRepulsion, resolveSemanticGravitation };
}
