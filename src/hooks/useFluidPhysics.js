import { useCallback } from 'react';

/**
 * Hook to apply physical billiard collision impulses and viscous proximity repulsion
 * between spatial nodes on the canvas.
 */
export function useFluidPhysics() {
  const resolveFluidRepulsion = useCallback((draggedId, currentPos, allNodes, onNodeMove) => {
    const draggedNode = allNodes.find((n) => n.id === draggedId);
    if (!draggedNode) return;

    const dWidth = draggedNode.width || 280;
    const dHeight = draggedNode.height || 220;
    const dCenterX = currentPos.x + dWidth / 2;
    const dCenterY = currentPos.y + dHeight / 2;

    const padding = 20; // Physical buffer between nodes

    allNodes.forEach((other) => {
      if (other.id === draggedId || other.hidden) return;

      const oWidth = other.width || 280;
      const oHeight = other.height || 220;
      const oCenterX = other.position.x + oWidth / 2;
      const oCenterY = other.position.y + oHeight / 2;

      // Distance between bounding box centers
      const dx = oCenterX - dCenterX;
      const dy = oCenterY - dCenterY;
      const dist = Math.hypot(dx, dy) || 1;

      // Minimum allowed distance along bounding radii
      const minRadiusX = (dWidth + oWidth) / 2 + padding;
      const minRadiusY = (dHeight + oHeight) / 2 + padding;

      // Check for axis-aligned bounding box collision / proximity
      const overlapX = minRadiusX - Math.abs(dx);
      const overlapY = minRadiusY - Math.abs(dy);

      if (overlapX > 0 && overlapY > 0) {
        // Physical Billiard Collision & Viscous Repulsion
        // Push along the shallower axis or separation angle
        let pushX = 0;
        let pushY = 0;

        if (overlapX < overlapY) {
          // Push horizontally
          pushX = Math.sign(dx || 1) * overlapX * 0.45;
        } else {
          // Push vertically
          pushY = Math.sign(dy || 1) * overlapY * 0.45;
        }

        // Add soft radial impulse to prevent axis lock
        const radialForce = Math.min(overlapX, overlapY) * 0.15;
        const angle = Math.atan2(dy, dx);
        pushX += Math.cos(angle) * radialForce;
        pushY += Math.sin(angle) * radialForce;

        onNodeMove(other.id, {
          x: other.position.x + pushX,
          y: other.position.y + pushY,
        });
      }
    });
  }, []);

  return { resolveFluidRepulsion };
}

