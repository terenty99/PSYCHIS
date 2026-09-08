/**
 * PSYCHIS Node & Payload Sanitizer
 * Guarantees that AI-generated or parsed data never contains raw objects where strings are expected,
 * preventing React 19 unmount crashes and white screens.
 */

export function sanitizeString(val, fallback = '') {
  if (val == null) return fallback;
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map((v) => sanitizeString(v)).filter(Boolean).join(', ');
  }
  if (typeof val === 'object') {
    return (
      val.title ||
      val.name ||
      val.text ||
      val.description ||
      val.summary ||
      val.label ||
      val.value ||
      fallback
    );
  }
  return fallback;
}

export function sanitizeFormula(formula) {
  if (!formula) return null;
  if (typeof formula === 'string') return formula.trim() || null;
  if (typeof formula === 'object') {
    return formula.formula || formula.equation || formula.latex || formula.expr || null;
  }
  return null;
}

export function sanitizePhotos(photos) {
  if (!Array.isArray(photos)) return [];
  const isBanned = (u) =>
    !u ||
    typeof u !== 'string' ||
    u.includes('1526374965328') || // Matrix green code
    u.includes('1518770660439') || // Cyan motherboard
    u.includes('1618005182384') || // Purple wave
    u.includes('1579546929518') || // Pastel rainbow
    u.includes('1532187863486') || // Chemistry beakers
    u.includes('1513694203232') || // Minimalist living room stock
    u.includes('1508700115892') || // Neon horizon stock
    u.includes('1579783902614') || // Classical remix stock
    u.includes('1550751827')    || // Default unsplash stock
    u.includes('1503899036084') || // Akihabara stock
    u.includes('1542751371');      // MLG stock

  return photos
    .filter((p) => {
      const u = typeof p === 'string' ? p : p?.url;
      return !isBanned(u);
    })
    .map((p, idx) => {
      if (!p) return null;
      if (typeof p === 'string') {
        return {
          id: `photo-${idx}-${Date.now()}`,
          url: p,
          type: p.toLowerCase().includes('.gif') ? 'gif' : 'photo',
          title: 'Visual Artifact',
          caption: 'Visual archive item attached to node.',
          author: 'Archive Origin',
          tag: 'Visual',
        };
      }
      if (typeof p === 'object' && p.url) {
        return {
          id: p.id || `photo-${idx}-${Date.now()}`,
          url: sanitizeString(p.url),
          type: p.type === 'gif' || (typeof p.url === 'string' && p.url.toLowerCase().includes('.gif')) ? 'gif' : 'photo',
          title: sanitizeString(p.title, 'Visual Artifact'),
          caption: sanitizeString(p.caption, 'Visual archive item attached to node.'),
          author: sanitizeString(p.author, 'Verified Origin'),
          source: sanitizeString(p.source, 'Web Archive'),
          tag: sanitizeString(p.tag, 'Visual'),
        };
      }
      return null;
    })
    .filter(Boolean);
}

export function sanitizeLayout(rawLayout) {
  if (!rawLayout || typeof rawLayout !== 'object') {
    return null;
  }

  const validStructures = new Set([
    'video_top',          // Video strictly spanning top, text below (width: 400-440px)
    'music_card',         // Waveform & acoustic card (width: 380-410px)
    'split_media_right',  // Photo on right, text on left (width: 440-490px)
    'split_media_left',   // Photo on left, text on right (width: 440-490px)
    'media_top',          // Photo/media on top, text below (width: 320-350px)
    'media_bottom',       // Header and text first, photo below (width: 320-350px)
    'split_formula',      // Formula on left, schematic SVG on right (width: 460-500px)
    'formula_top',        // Formula card at top, text below (width: 340-400px)
    'text_dossier',       // Pure analytical text/takeaways, no photos (width: 350-420px)
    'minimal_quote',      // Compact thesis card (width: 280-320px)
    'kinetic_mechanism',  // Wide mechanism / schematic card (width: 380-440px)
    'visual_hero',        // Alias for media_top
    'formula_hero',       // Alias for formula_top
    'dossier',            // Alias for text_dossier
    'mechanism',          // Alias for kinetic_mechanism
    'compact_metric',
    'balanced',
    'auto',
  ]);

  const rawStructure = sanitizeString(rawLayout.structure, 'auto').toLowerCase();
  const structure = validStructures.has(rawStructure) ? rawStructure : 'auto';

  // Calculate intelligent minimum default width based on structure
  let defaultWidth = 335;
  if (structure === 'video_top') defaultWidth = 420;
  else if (structure === 'music_card') defaultWidth = 390;
  else if (structure === 'split_media_right' || structure === 'split_media_left') defaultWidth = 460;
  else if (structure === 'split_formula') defaultWidth = 480;
  else if (structure === 'text_dossier' || structure === 'dossier') defaultWidth = 360;
  else if (structure === 'kinetic_mechanism' || structure === 'mechanism') defaultWidth = 400;
  else if (structure === 'minimal_quote') defaultWidth = 290;

  const width =
    typeof rawLayout.width === 'number' && !isNaN(rawLayout.width)
      ? Math.max(260, Math.min(540, Math.round(rawLayout.width)))
      : defaultWidth;

  const mediaMaxHeight =
    typeof rawLayout.mediaMaxHeight === 'number' && !isNaN(rawLayout.mediaMaxHeight)
      ? Math.max(80, Math.min(320, Math.round(rawLayout.mediaMaxHeight)))
      : undefined;

  return {
    width,
    structure,
    aspectRatio: sanitizeString(rawLayout.aspectRatio, 'auto'),
    mediaAspect: sanitizeString(rawLayout.mediaAspect, 'auto'),
    ...(mediaMaxHeight ? { mediaMaxHeight } : {}),
    density: sanitizeString(rawLayout.density, 'comfortable'),
  };
}

export function isNonStemOrHumanitiesTopic(title = '', category = '', desc = '') {
  const combined = `${title} ${category} ${desc}`.toLowerCase();
  return (
    /\b(character|protagonist|antagonist|villain|detective|consultant|agent|officer|actor|actress|director|author|person|biography|figure|fictional|historical figure|profile)\b/i.test(combined) ||
    /\b(television|tv show|series|episode|movie|cinema|film|anime|manga|animation|novel|book|play|drama|literature|pop culture|music|album|folklore|mythology)\b/i.test(combined)
  );
}

export function isPseudoscientificFormula(formulaStr) {
  if (!formulaStr || typeof formulaStr !== 'string') return false;
  return /\b(authority|empathy|justice|truth|morality|sanity|psyche|behavior|character|lisbon|jane|emotion|crime|karma|love|hate|hero|villain)\b/i.test(formulaStr);
}

export function sanitizeNodeData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return {
      title: 'Synthesized Artifact',
      category: 'spatial knowledge // artifact',
      status: 'synthesized',
      description: 'Synthesized knowledge artifact.',
      detailedSynthesis: 'Synthesized knowledge artifact.',
      source: 'AI Synthesis',
      url: null,
      formula: null,
      formulaType: null,
      schemaSvg: null,
      schemaType: null,
      derivationSteps: [],
      photos: [],
      targetedInquiries: [],
    };
  }

  const title = sanitizeString(rawData.title, 'Synthesized Artifact');
  const category = sanitizeString(rawData.category, 'spatial knowledge // artifact');
  const status = sanitizeString(rawData.status, 'synthesized');
  const description = sanitizeString(
    rawData.description,
    sanitizeString(rawData.detailedSynthesis, 'Synthesized knowledge artifact.')
  );
  const detailedSynthesis = sanitizeString(rawData.detailedSynthesis, description);
  const source = sanitizeString(rawData.source, 'Spatial Knowledge Engine');
  const url = typeof rawData.url === 'string' && rawData.url.startsWith('http') ? rawData.url : null;
  let formula = sanitizeFormula(rawData.formula);
  let formulaType = sanitizeString(rawData.formulaType, null);
  let schemaSvg = typeof rawData.schemaSvg === 'string' && rawData.schemaSvg.includes('<svg') ? rawData.schemaSvg : null;
  let schemaType = schemaSvg ? (rawData.schemaType || 'custom_svg') : null;
  let derivationSteps = Array.isArray(rawData.derivationSteps) ? rawData.derivationSteps : [];

  // DOMAIN PROTECTION: Human characters, television, cinema, history, and humanities
  // must NEVER be polluted with pseudoscientific fake formulas, fake proofs, or circuit schematics!
  const isHumanities = isNonStemOrHumanitiesTopic(title, category, description);
  const isBogusFormula = isPseudoscientificFormula(formula);

  if (isHumanities || isBogusFormula) {
    formula = null;
    formulaType = null;
    schemaSvg = null;
    schemaType = null;
    derivationSteps = [];
  }

  const photos = sanitizePhotos(rawData.photos || rawData.images);
  const layout = sanitizeLayout(rawData.layout);

  const hasKineticExplicit = Boolean(rawData.hasKinetic || rawData.isKinetic || rawData.gifUrl || rawData.gifSvg);
  const isKineticCategory = /physic|mechanic|kinematic|dynamic|robot|transport|engine|vehicle|machin|motion|aero|bike|wheel/i.test(category + ' ' + title);

  if (layout && layout.structure === 'kinetic_mechanism' && !hasKineticExplicit && (isHumanities || !isKineticCategory)) {
    layout.structure = 'auto';
  }

  const targetedInquiries = Array.isArray(rawData.targetedInquiries)
    ? rawData.targetedInquiries.map((q) => sanitizeString(q)).filter(Boolean)
    : [];

  const connections = Array.isArray(rawData.connections)
    ? rawData.connections
        .filter((c) => c && typeof c === 'object')
        .map((c) => ({
          targetNodeId: sanitizeString(c.targetNodeId || c.nodeId || c.connectedNodeId, ''),
          sourceNodeId: sanitizeString(c.sourceNodeId, ''),
          label: sanitizeString(c.label || c.connectionLabel, ''),
          explanation: sanitizeString(c.explanation || c.connectionExplanation || c.description, ''),
          relationshipType: sanitizeString(c.relationshipType, 'neutral'),
          mechanism: sanitizeString(c.mechanism, ''),
        }))
    : [];

  const connectedNodeIds = Array.isArray(rawData.connectedNodeIds)
    ? rawData.connectedNodeIds.map((id) => sanitizeString(id)).filter(Boolean)
    : connections.map((c) => c.targetNodeId).filter(Boolean);

  const primaryPhoto = rawData.primaryPhoto || (Array.isArray(photos) && photos[0]) || null;

  // Video & Music Archetype Sanitization
  const isVideo =
    rawData.mediaType === 'video' ||
    Boolean(rawData.videoData) ||
    Boolean(rawData.videoQuery) ||
    layout?.structure === 'video_top';

  const isMusic =
    rawData.mediaType === 'music' ||
    Boolean(rawData.musicData) ||
    layout?.structure === 'music_card';

  const mediaType = isVideo ? 'video' : isMusic ? 'music' : sanitizeString(rawData.mediaType, 'photo');

  const videoData = isVideo && rawData.videoData ? {
    id: sanitizeString(rawData.videoData.id, `vid-${Date.now()}`),
    videoId: sanitizeString(rawData.videoData.videoId, null),
    title: sanitizeString(rawData.videoData.title, title),
    duration: sanitizeString(rawData.videoData.duration, ''),
    uploader: sanitizeString(rawData.videoData.uploader, 'Video Source'),
    url: sanitizeString(rawData.videoData.url, ''),
    platform: sanitizeString(rawData.videoData.platform, 'youtube'),
    thumbnail: sanitizeString(rawData.videoData.thumbnail, ''),
  } : null;

  const musicData = isMusic && rawData.musicData ? {
    id: sanitizeString(rawData.musicData.id, `music-${Date.now()}`),
    trackTitle: sanitizeString(rawData.musicData.trackTitle || rawData.musicData.title, title),
    artist: sanitizeString(rawData.musicData.artist, 'Unknown Artist'),
    album: sanitizeString(rawData.musicData.album, 'Single / EP'),
    year: sanitizeString(rawData.musicData.year, ''),
    genre: sanitizeString(rawData.musicData.genre, 'Music'),
    previewUrl: sanitizeString(rawData.musicData.previewUrl, ''),
    fullTrackUrl: sanitizeString(rawData.musicData.fullTrackUrl, ''),
    duration: typeof rawData.musicData.duration === 'number' ? rawData.musicData.duration : 30,
    artwork: sanitizeString(rawData.musicData.artwork, ''),
    source: sanitizeString(rawData.musicData.source, 'Public Audio Engine'),
  } : null;

  const savedTimestamp = typeof rawData.savedTimestamp === 'number' && !isNaN(rawData.savedTimestamp)
    ? rawData.savedTimestamp
    : 0;

  return {
    title,
    category,
    status,
    description,
    detailedSynthesis,
    source,
    url,
    mediaType,
    videoData,
    videoQuery: sanitizeString(rawData.videoQuery, null),
    videoPlatform: sanitizeString(rawData.videoPlatform, 'youtube'),
    musicData,
    savedTimestamp,
    formula,
    formulaType,
    schemaSvg,
    schemaType,
    derivationSteps,
    proofSteps: derivationSteps,
    photos,
    primaryPhoto,
    gifUrl: rawData.gifUrl || null,
    gifSvg: rawData.gifSvg || null,
    gifTitle: rawData.gifTitle || null,
    gifCaption: rawData.gifCaption || null,
    isKinetic: Boolean(rawData.isKinetic || rawData.gifUrl || rawData.gifSvg),
    hasKinetic: Boolean(rawData.hasKinetic || rawData.gifUrl || rawData.gifSvg),
    media: Array.isArray(rawData.media) ? rawData.media : [],
    targetedInquiries,
    connections,
    connectedNodeIds,
    connectionExplanation: sanitizeString(rawData.connectionExplanation, null),
    connectionLabel: sanitizeString(rawData.connectionLabel, null),
    connectionFormula: sanitizeFormula(rawData.connectionFormula),
    connectedNodeId: sanitizeString(rawData.connectedNodeId, null),
    ...(layout ? { layout } : {}),
  };
}
