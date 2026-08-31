/**
 * Generates natural, flowing organic Bézier curves between two nodes.
 * Replaces harsh 90° doglegs with smooth, relationship-influenced trajectories.
 */
export function generateOrganicPath(start, end, relationshipType = 'DEFAULT') {
  if (!start || !end) return { d: '', midpoint: { x: 0, y: 0 } };

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return { d: '', midpoint: { x: start.x, y: start.y } };

  const baseAngle = Math.atan2(dy, dx);
  let biasAngle = 0;
  let biasMagnitude = 0;

  switch (relationshipType) {
    case 'ORIGIN_URL':
      // Source connections: shallow, flowing outward
      biasAngle = baseAngle + (Math.PI / 4) * 0.8;
      biasMagnitude = distance * 0.16;
      break;

    case 'COUPLED_SYSTEM':
      // Coupled connections: perpendicular but flexible
      biasAngle = baseAngle + (Math.PI / 2) * 0.9;
      biasMagnitude = distance * 0.22;
      break;

    case 'CONTRADICTS':
      // Contradiction: opposing sweep with soft curve
      biasAngle = baseAngle - (Math.PI / 2) * 0.85;
      biasMagnitude = distance * 0.20;
      break;

    default:
      // Default: gentle organic drift
      biasAngle = baseAngle + (Math.PI / 3) * 0.6;
      biasMagnitude = distance * 0.14;
      break;
  }

  // Calculate control points for cubic Bézier
  const control1 = {
    x: start.x + dx * 0.35 + Math.cos(biasAngle) * biasMagnitude,
    y: start.y + dy * 0.35 + Math.sin(biasAngle) * biasMagnitude,
  };

  const control2 = {
    x: end.x - dx * 0.35 - Math.cos(biasAngle) * (biasMagnitude * 0.8),
    y: end.y - dy * 0.35 - Math.sin(biasAngle) * (biasMagnitude * 0.8),
  };

  // Subtle wobble for organic tactile feel
  const wobble1 = Math.sin(start.x * 0.02) * 1.2;
  const wobble2 = Math.cos(end.x * 0.02) * 1.2;

  const c1x = control1.x + Math.cos(biasAngle + Math.PI / 2) * wobble1;
  const c1y = control1.y + Math.sin(biasAngle + Math.PI / 2) * wobble1;
  const c2x = control2.x + Math.cos(biasAngle + Math.PI / 2) * wobble2;
  const c2y = control2.y + Math.sin(biasAngle + Math.PI / 2) * wobble2;

  const d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

  // True cubic bezier midpoint calculation at t = 0.5
  // B(0.5) = 0.125*P0 + 0.375*P1 + 0.375*P2 + 0.125*P3
  const midX = 0.125 * start.x + 0.375 * c1x + 0.375 * c2x + 0.125 * end.x;
  const midY = 0.125 * start.y + 0.375 * c1y + 0.375 * c2y + 0.125 * end.y;

  return {
    d,
    midpoint: { x: midX, y: midY },
  };
}
