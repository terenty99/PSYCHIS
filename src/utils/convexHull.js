/**
 * PSYCHIS — Convex Hull & Organic Membrane Geometry Engine
 * Implements:
 * 1. Monotone Chain (Andrew's Algorithm) 2D Convex Hull
 * 2. Outward/Inward Normal Offset Polygon Expansion (R = 36px padding)
 * 3. Chaikin's Corner-Cutting Algorithm (2 iterations) for organic bezier-smooth hulls
 * 4. Golden-Ratio Grid Auto-Tidy Layout for Spatial Clusters
 */

import { getNodeDimensions } from './canvasPlacement';

/**
 * Computes the 2D cross product of vector OA and OB.
 * > 0 for counter-clockwise turn, < 0 for clockwise, 0 for collinear.
 */
function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Computes 2D Convex Hull using Andrew's Monotone Chain algorithm.
 * Returns an array of vertices in counter-clockwise order.
 */
export function computeConvexHull(points) {
  if (!points || points.length < 3) return points ? [...points] : [];

  // Sort points primarily by x, secondarily by y
  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  // Build lower hull
  const lower = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build upper hull
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove the last point of each half because it is repeated at the beginning of the other
  lower.pop();
  upper.pop();

  return lower.concat(upper);
}

/**
 * Extracts all 4 bounding corners for a collection of spatial nodes.
 */
export function getNodesCornerPoints(nodes, measuredDims = {}) {
  const points = [];
  if (!Array.isArray(nodes)) return points;

  nodes.forEach((node) => {
    if (!node || node.hidden) return;
    const pos = node.position || { x: 0, y: 0 };
    const dims = (measuredDims && measuredDims[node.id]) || getNodeDimensions(node);
    const x = pos.x;
    const y = pos.y;
    const w = dims.width || 300;
    const h = dims.height || 220;

    points.push({ x, y });
    points.push({ x: x + w, y });
    points.push({ x: x + w, y: y + h });
    points.push({ x, y: y + h });
  });

  return points;
}

/**
 * Offsets a 2D closed polygon outward (or inward if offset < 0) along vertex angle bisectors.
 */
export function offsetPolygon(hull, offset = 36) {
  const n = hull.length;
  if (n < 3) return hull;

  const result = [];
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];

    // Edge vectors
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };

    const len1 = Math.hypot(v1.x, v1.y) || 1;
    const len2 = Math.hypot(v2.x, v2.y) || 1;

    // Outward unit normal vectors (assuming CCW winding)
    const n1 = { x: v1.y / len1, y: -v1.x / len1 };
    const n2 = { x: v2.y / len2, y: -v2.x / len2 };

    // Bisector normal vector
    let bx = n1.x + n2.x;
    let by = n1.y + n2.y;
    const bLen = Math.hypot(bx, by);

    if (bLen < 0.001) {
      // Degenerate collinear vertex
      result.push({
        x: curr.x + n1.x * offset,
        y: curr.y + n1.y * offset,
      });
      continue;
    }

    bx /= bLen;
    by /= bLen;

    // Dot product with edge normal to compute miter scale: 1 / cos(theta/2)
    const cosHalf = bx * n1.x + by * n1.y;
    const scale = Math.min(Math.max(cosHalf, 0.35), 1.0); // Clamp to prevent sharp spiked miters
    const miterDist = offset / scale;

    result.push({
      x: curr.x + bx * miterDist,
      y: curr.y + by * miterDist,
    });
  }

  return result;
}

/**
 * Chaikin's Corner-Cutting Algorithm to smooth polygon vertices.
 * Performs iterative corner cutting to generate continuous rounded curves.
 */
export function chaikinSmooth(points, iterations = 2) {
  if (!points || points.length < 3) return points;

  let current = [...points];

  for (let it = 0; it < iterations; it++) {
    const next = [];
    const n = current.length;

    for (let i = 0; i < n; i++) {
      const p0 = current[i];
      const p1 = current[(i + 1) % n];

      // Q = 3/4 P0 + 1/4 P1
      // R = 1/4 P0 + 3/4 P1
      const q = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      };
      const r = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      };

      next.push(q);
      next.push(r);
    }
    current = next;
  }

  return current;
}

/**
 * Converts smoothed polygon points into a closed SVG path string with quadratic curves.
 */
export function pointsToSvgPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length < 3) {
    return `M ${points[0].x} ${points[0].y} L ${points[1]?.x || points[0].x} ${points[1]?.y || points[0].y} Z`;
  }

  const n = points.length;
  // Midpoints between adjacent points serve as smooth on-curve junctions
  const midpoints = [];
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    midpoints.push({
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    });
  }

  let d = `M ${midpoints[0].x.toFixed(1)} ${midpoints[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const cp = points[(i + 1) % n]; // Control point is the original vertex
    const end = midpoints[(i + 1) % n];
    d += ` Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }
  d += ' Z';

  return d;
}

/**
 * Generates the outer smoothed hull and the secondary inner isoline for a cluster of nodes.
 */
export function generateClusterHullPaths(nodes, measuredDims = {}) {
  const corners = getNodesCornerPoints(nodes, measuredDims);
  if (corners.length === 0) return null;

  // 1. Compute Base Convex Hull
  const rawHull = computeConvexHull(corners);
  if (rawHull.length < 3) {
    // If only 1 or 2 nodes, synthesize bounding rectangle hull
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    corners.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    const rectHull = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
    const padded = offsetPolygon(rectHull, 36);
    const smoothed = chaikinSmooth(padded, 2);
    const innerPadded = offsetPolygon(rectHull, 28);
    const innerSmoothed = chaikinSmooth(innerPadded, 2);

    return {
      outerPath: pointsToSvgPath(smoothed),
      innerPath: pointsToSvgPath(innerSmoothed),
      bounds: {
        minX: minX - 36,
        minY: minY - 36,
        maxX: maxX + 36,
        maxY: maxY + 36,
        width: maxX - minX + 72,
        height: maxY - minY + 72,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
      },
      headerPos: { x: minX - 16, y: minY - 28 },
    };
  }

  // 2. Expand outward by R = 36px
  const paddedHull = offsetPolygon(rawHull, 36);
  // 3. Smooth with Chaikin's Algorithm (2 iterations)
  const smoothedHull = chaikinSmooth(paddedHull, 2);
  const outerPath = pointsToSvgPath(smoothedHull);

  // 4. Secondary Inner Isoline (8px inside the main boundary = 28px from raw hull)
  const innerHull = offsetPolygon(rawHull, 26);
  const smoothedInner = chaikinSmooth(innerHull, 2);
  const innerPath = pointsToSvgPath(smoothedInner);

  // 5. Bounding box and header anchor
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  smoothedHull.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  return {
    outerPath,
    innerPath,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    },
    headerPos: { x: minX + 16, y: minY + 8 },
  };
}

/**
 * Auto-Tidy Algorithm: arranges the given nodes into an optimal Golden-Ratio grid layout
 * with standardized 32px gutters, centered around their current center of mass.
 */
export function autoTidyNodes(nodesToTidy, measuredDims = {}) {
  if (!Array.isArray(nodesToTidy) || nodesToTidy.length <= 1) return {};

  // Calculate current centroid
  let sumX = 0;
  let sumY = 0;
  const count = nodesToTidy.length;

  nodesToTidy.forEach((n) => {
    const dims = (measuredDims && measuredDims[n.id]) || getNodeDimensions(n);
    sumX += n.position.x + dims.width / 2;
    sumY += n.position.y + dims.height / 2;
  });

  const centerX = sumX / count;
  const centerY = sumY / count;

  // Determine optimal column count based on Golden Ratio ~1.618 or sqrt(count)
  const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt(count * 1.618))));
  const rows = Math.ceil(count / cols);

  const gutterX = 36;
  const gutterY = 36;

  // Compute column max widths and row max heights
  const colWidths = new Array(cols).fill(0);
  const rowHeights = new Array(rows).fill(0);

  nodesToTidy.forEach((n, idx) => {
    const dims = (measuredDims && measuredDims[n.id]) || getNodeDimensions(n);
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    colWidths[col] = Math.max(colWidths[col], dims.width);
    rowHeights[row] = Math.max(rowHeights[row], dims.height);
  });

  // Calculate total grid width and height
  const totalW = colWidths.reduce((a, b) => a + b, 0) + (cols - 1) * gutterX;
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + (rows - 1) * gutterY;

  const startX = centerX - totalW / 2;
  const startY = centerY - totalH / 2;

  // Calculate top-left positions
  const updates = {};
  nodesToTidy.forEach((n, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    let offsetX = 0;
    for (let c = 0; c < col; c++) offsetX += colWidths[c] + gutterX;

    let offsetY = 0;
    for (let r = 0; r < row; r++) offsetY += rowHeights[r] + gutterY;

    updates[n.id] = {
      x: Math.round(startX + offsetX),
      y: Math.round(startY + offsetY),
    };
  });

  return updates;
}
