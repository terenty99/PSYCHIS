/**
 * Generates natural, flowing organic Bézier curves between two nodes matching the mock site.
 * When isArrowed is true, trims the path to the target card's perimeter so the arrowhead
 * is clearly visible outside the opaque card instead of being hidden underneath.
 */
export function generateOrganicPath(p1, p2, relationshipType = 'DEFAULT', targetDims = null, isArrowed = false) {
  if (!p1 || !p2) return { d: '', midpoint: { x: 0, y: 0 } };

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  let c1x, c1y, c2x, c2y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal dominant flow
    c1x = p1.x + dx * 0.45;
    c1y = p1.y;
    c2x = p2.x - dx * 0.45;
    c2y = p2.y;
  } else {
    // Vertical / diagonal flow
    c1x = p1.x + dx * 0.5;
    c1y = p1.y + dy * 0.1;
    c2x = p2.x - dx * 0.2;
    c2y = p2.y - dy * 0.5;
  }

  let finalP2 = { x: p2.x, y: p2.y };
  let finalC2 = { x: c2x, y: c2y };

  if (isArrowed && targetDims && targetDims.width && targetDims.height) {
    const vx = p2.x - c2x;
    const vy = p2.y - c2y;
    const len = Math.hypot(vx, vy);

    if (len > 0.001) {
      const ux = vx / len;
      const uy = vy / len;

      // 2px offset so arrow marker tip (viewBox 10x10, refX 7, tip at 8) touches card border with crisp 1.2px clearance
      const hw = targetDims.width / 2 + 2;
      const hh = targetDims.height / 2 + 2;

      const dxLimit = Math.abs(ux) > 0.0001 ? hw / Math.abs(ux) : Infinity;
      const dyLimit = Math.abs(uy) > 0.0001 ? hh / Math.abs(uy) : Infinity;
      const totalDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const dBoundary = Math.min(dxLimit, dyLimit, Math.max(0, totalDist - 30));

      finalP2 = {
        x: p2.x - dBoundary * ux,
        y: p2.y - dBoundary * uy,
      };

      // Keep control point c2 naturally positioned relative to new endpoint
      finalC2 = {
        x: c2x - dBoundary * ux * 0.5,
        y: c2y - dBoundary * uy * 0.5,
      };
    }
  }

  const midX = (p1.x + c1x * 3 + finalC2.x * 3 + finalP2.x) / 8;
  const midY = (p1.y + c1y * 3 + finalC2.y * 3 + finalP2.y) / 8;

  return {
    d: `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${finalC2.x} ${finalC2.y}, ${finalP2.x} ${finalP2.y}`,
    midpoint: { x: midX, y: midY },
  };
}
