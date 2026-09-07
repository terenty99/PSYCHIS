/**
 * PSYCHIS Spatial Canvas Placement Engine
 * Implements 2D Axis-Aligned Bounding Box (AABB) collision detection and radial
 * open-space resolution derived from the mock site's billiard physics equations.
 */

const DEFAULT_PADDING = 28;

/**
 * Calculates adaptive dynamic dimensions for a node based on its layout metadata or content.
 */
export function getNodeDimensions(nodeOrData) {
  if (!nodeOrData) {
    return { width: 320, height: 260 };
  }

  const data = nodeOrData.data || nodeOrData;
  const layout = data.layout || {};

  const hasSchema = Boolean(data.schemaSvg);
  const hasFormula = Boolean(data.formula);
  const isGif =
    data.photos?.some((p) => p?.type === 'gif' || (typeof p?.url === 'string' && p.url.toLowerCase().includes('.gif'))) ||
    Boolean(data.gifUrl) ||
    (typeof data.url === 'string' && data.url.toLowerCase().includes('.gif'));

  const primaryMedia =
    (data.gifUrl
      ? { url: data.gifUrl, type: 'gif', title: data.title }
      : null) ||
    data.primaryPhoto ||
    (Array.isArray(data.photos) && data.photos[0]) ||
    (Array.isArray(data.media) && data.media.find((m) => m?.url)) ||
    null;

  const hasMedia = Boolean((primaryMedia && primaryMedia.url && !hasSchema) || (primaryMedia && isGif));

  const textCorpus = [
    data.title,
    data.category,
    data.description,
    data.detailedSynthesis,
    layout.aspectRatio,
    layout.mediaAspect,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const isPortrait =
    layout.mediaAspect === 'portrait' ||
    layout.mediaAspect === '3:4' ||
    layout.mediaAspect === '4:5' ||
    layout.aspectRatio === 'portrait' ||
    /\b(person|who is|portrait|character|figure|actor|actress|author|detective|consultant|biography|protagonist|antagonist|fictional character|television character)\b/i.test(
      textCorpus
    );

  let effectiveStructure = layout.structure || 'auto';
  if (effectiveStructure === 'auto' || effectiveStructure === 'balanced') {
    const seed = (nodeOrData.id || '') + (data.title || '') + (data.category || '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const posHash = Math.abs(hash);

    if (hasFormula) {
      if (hasSchema) {
        effectiveStructure = posHash % 2 === 0 ? 'split_formula' : 'formula_top';
      } else {
        effectiveStructure = posHash % 2 === 0 ? 'formula_top' : 'text_dossier';
      }
    } else if (hasMedia) {
      const archetypes = [
        'split_media_right',
        'media_top',
        'split_media_left',
        'media_bottom',
        'text_dossier',
      ];
      effectiveStructure = archetypes[posHash % archetypes.length];
    } else {
      effectiveStructure = posHash % 3 === 0 ? 'minimal_quote' : 'text_dossier';
    }
  }

  const isSplitMedia = effectiveStructure === 'split_media_right' || effectiveStructure === 'split_media_left';
  const isSplitFormula = effectiveStructure === 'split_formula';

  // 1. DYNAMIC WIDTH
  let width = layout.width || nodeOrData.width;
  if (!width || typeof width !== 'number' || isNaN(width) || width < 250) {
    if (isSplitMedia) {
      width = 460;
    } else if (isSplitFormula) {
      width = 485;
    } else if (effectiveStructure === 'text_dossier') {
      width = 360;
    } else if (effectiveStructure === 'minimal_quote') {
      width = 295;
    } else if (isGif) {
      width = 390;
    } else if (hasSchema || (hasFormula && typeof data.formula === 'string' && data.formula.length > 35)) {
      width = 370;
    } else if (isPortrait) {
      width = 340;
    } else if (data.detailedSynthesis && data.detailedSynthesis.length > 400) {
      width = 350;
    } else {
      width = 320;
    }
  }

  // 2. DYNAMIC HEIGHT
  let height = layout.height || (nodeOrData.height && nodeOrData.height !== 250 ? nodeOrData.height : null);
  if (!height || typeof height !== 'number' || isNaN(height)) {
    let estHeight = 150;

    if (data.category && data.category.length > 25) estHeight += 16;
    if (layout.density === 'expanded') estHeight += 40;
    else if (layout.density === 'compact') estHeight -= 20;

    if (isSplitMedia) {
      // In horizontal split layout, media is side-by-side with text rather than stacked
      estHeight = Math.max(160, estHeight + (data.detailedSynthesis ? 40 : 15));
    } else if (isGif || effectiveStructure === 'kinetic_mechanism') {
      estHeight += 175;
    } else if (data.schemaSvg) {
      estHeight += layout.mediaMaxHeight || 120;
    } else if (hasMedia) {
      const defaultMediaH = isPortrait ? 220 : (layout.mediaMaxHeight || 170);
      estHeight += defaultMediaH + 12;
    }

    if (hasFormula && !isSplitFormula) {
      estHeight += 60;
    }

    if (data.metrics && typeof data.metrics === 'object' && Object.keys(data.metrics).length > 0) {
      estHeight += 36;
    }

    if (nodeOrData.type === 'website') {
      estHeight += 110;
    }

    height = Math.max(140, Math.round(estHeight));
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Checks if two bounding boxes intersect, accounting for safety padding.
 */
export function checkBoundingBoxOverlap(posA, widthA, heightA, posB, widthB, heightB, padding = DEFAULT_PADDING) {
  const dCX = posA.x + widthA / 2;
  const dCY = posA.y + heightA / 2;
  const oCX = posB.x + widthB / 2;
  const oCY = posB.y + heightB / 2;

  const dx = oCX - dCX;
  const dy = oCY - dCY;
  const minX = (widthA + widthB) / 2 + padding;
  const minY = (heightA + heightB) / 2 + padding;

  const overlapX = minX - Math.abs(dx);
  const overlapY = minY - Math.abs(dy);

  return overlapX > 0 && overlapY > 0;
}

/**
 * Tests whether a proposed node rectangle collides with any node in the list.
 */
export function isPositionColliding(pos, width, height, existingNodes, padding = DEFAULT_PADDING) {
  if (!existingNodes || existingNodes.length === 0) return false;

  for (const node of existingNodes) {
    if (node.hidden) continue;
    const dims = getNodeDimensions(node);
    const nW = dims.width;
    const nH = dims.height;
    const nPos = node.position || { x: 0, y: 0 };

    if (checkBoundingBoxOverlap(pos, width, height, nPos, nW, nH, padding)) {
      return true;
    }
  }
  return false;
}

/**
 * Finds the nearest collision-free position for a single node using an expanding radial search.
 */
export function findCollisionFreePosition(desiredPos, width = 320, height = 260, existingNodes = [], padding = DEFAULT_PADDING) {
  if (!isPositionColliding(desiredPos, width, height, existingNodes, padding)) {
    return { ...desiredPos };
  }

  // Expanding radial search
  const radii = [60, 120, 180, 240, 320, 420, 540, 680];
  const angleSteps = 12; // Test 30-degree increments

  for (const r of radii) {
    for (let i = 0; i < angleSteps; i++) {
      const angle = (i / angleSteps) * 2 * Math.PI;
      const candidate = {
        x: Math.round(desiredPos.x + Math.cos(angle) * r),
        y: Math.round(desiredPos.y + Math.sin(angle) * r),
      };

      if (!isPositionColliding(candidate, width, height, existingNodes, padding)) {
        return candidate;
      }
    }
  }

  // Fallback offset if canvas is extremely dense
  return {
    x: desiredPos.x + 380,
    y: desiredPos.y + 130,
  };
}

/**
 * Calculates collision-free coordinates for a full spawned cluster (primary root + branch nodes).
 * Accurately supports individual dynamic dimensions for both the primary and all branch nodes.
 */
export function findClusterPositions({
  centerPos,
  primaryWidth = 320,
  primaryHeight = 260,
  branchNodes = [],
  branchCount = 0,
  branchWidth = 320,
  branchHeight = 260,
  existingNodes = [],
  padding = DEFAULT_PADDING,
}) {
  const count = branchNodes.length > 0 ? branchNodes.length : branchCount;

  // 1. Locate clear footprint for primary node
  const primaryPos = findCollisionFreePosition(centerPos, primaryWidth, primaryHeight, existingNodes, padding);

  // Track placed nodes in this cluster to prevent intra-cluster overlap
  const placedClusterNodes = [
    {
      id: '__primary__',
      position: primaryPos,
      width: primaryWidth,
      height: primaryHeight,
    },
  ];

  const branchPositions = [];

  // Calculate average branch dimensions to dynamically scale cluster orbital radius
  let avgBranchWidth = branchWidth;
  let avgBranchHeight = branchHeight;

  if (branchNodes.length > 0) {
    const totalW = branchNodes.reduce((acc, b) => acc + (getNodeDimensions(b).width), 0);
    const totalH = branchNodes.reduce((acc, b) => acc + (getNodeDimensions(b).height), 0);
    avgBranchWidth = totalW / branchNodes.length;
    avgBranchHeight = totalH / branchNodes.length;
  }

  // Dynamic base radius based on primary and branch geometry
  const baseRadius = Math.max(380, Math.round((primaryWidth + avgBranchWidth) * 0.62 + 70));

  // Organic angle distribution based on total branches
  const angleStep = count > 0 ? (1.65 * Math.PI) / count : Math.PI;
  const initialOffset = (Math.random() * 0.4 - 0.2) * Math.PI;

  for (let idx = 0; idx < count; idx++) {
    const bNode = branchNodes[idx];
    const bDims = bNode ? getNodeDimensions(bNode) : { width: branchWidth, height: branchHeight };
    const bW = bDims.width;
    const bH = bDims.height;

    // Varied organic distribution angle
    const baseAngle = initialOffset + 0.28 * Math.PI + idx * angleStep;
    let chosenPos = null;

    // Search across angles and expanding radii for each branch
    const angularDeltas = [0, 0.2, -0.2, 0.4, -0.4, 0.65, -0.65, 0.9, -0.9];
    const radiusMultipliers = [1.0, 1.15, 1.3, 1.45, 1.65];

    outerSearch:
    for (const rMult of radiusMultipliers) {
      const currentRadius = baseRadius * rMult;
      for (const dAngle of angularDeltas) {
        const testAngle = baseAngle + dAngle;
        const candidate = {
          x: Math.round(primaryPos.x + Math.cos(testAngle) * currentRadius),
          y: Math.round(primaryPos.y + Math.sin(testAngle) * (currentRadius * 0.82)),
        };

        const allObstacles = [...existingNodes, ...placedClusterNodes];
        if (!isPositionColliding(candidate, bW, bH, allObstacles, padding)) {
          chosenPos = candidate;
          break outerSearch;
        }
      }
    }

    if (!chosenPos) {
      // Fallback
      chosenPos = {
        x: Math.round(primaryPos.x + Math.cos(baseAngle) * (baseRadius * 1.65)),
        y: Math.round(primaryPos.y + Math.sin(baseAngle) * (baseRadius * 1.35)),
      };
    }

    placedClusterNodes.push({
      id: `__branch_${idx}__`,
      position: chosenPos,
      width: bW,
      height: bH,
    });

    branchPositions.push(chosenPos);
  }

  return { primaryPos, branchPositions };
}
