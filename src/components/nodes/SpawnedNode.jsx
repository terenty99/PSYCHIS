import React, { useState, useEffect } from 'react';
import { SmartGlassPanel } from '../ui/SmartGlassPanel';
import { MathFormula } from '../../utils/mathRenderer';

export const SpawnedNode = ({
  node,
  isSelected,
  isAnticipating = false,
  isDragging,
  isLinkSelected = false,
  isLinkShaking = false,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onInspect,
  onSpecificProbe,
  onOpenBrowser,
}) => {
  // Detect attached media artifacts (GIF or Photo) — prioritize assigned kinetic GIF
  const primaryMedia =
    (node.data?.gifUrl || node.data?.gifSvg
      ? {
          url: node.data.gifUrl,
          svg: node.data.gifSvg || null,
          type: 'gif',
          author: node.data.author || 'AI Kinetic Synthesizer',
          title: node.data.gifTitle || node.data.title || 'Kinetic Simulation',
          caption: node.data.gifCaption || null,
        }
      : null) ||
    node.data?.primaryPhoto ||
    (Array.isArray(node.data?.photos) && node.data.photos[0]) ||
    (Array.isArray(node.data?.media) && node.data.media.find((m) => m.url)) ||
    null;

  const [imageError, setImageError] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState(() =>
    primaryMedia?.width && primaryMedia?.height
      ? primaryMedia.width / primaryMedia.height
      : null
  );

  // Reset image error and aspect ratio whenever media URL or visual changes
  useEffect(() => {
    setImageError(false);
    if (primaryMedia?.width && primaryMedia?.height) {
      setNaturalAspect(primaryMedia.width / primaryMedia.height);
    } else {
      setNaturalAspect(null);
    }
  }, [node.data?.gifUrl, node.data?.gifSvg, node.data?.primaryPhoto?.url, node.data?.photos?.[0]?.url]);

  const isGif =
    Boolean(node.data?.gifUrl) ||
    Boolean(node.data?.gifSvg) ||
    Boolean(node.data?.isKinetic) ||
    primaryMedia?.type === 'gif' ||
    Boolean(primaryMedia?.url && primaryMedia.url.toLowerCase().includes('.gif'));

  const layout = node.data?.layout || {};
  const density = layout.density || 'comfortable';

  const descClampClass =
    density === 'expanded'
      ? 'line-clamp-6'
      : density === 'compact'
      ? 'line-clamp-2'
      : 'line-clamp-4';

  const textCorpus = [
    node.data?.title,
    node.data?.category,
    node.data?.description,
    layout.aspectRatio,
    layout.mediaAspect,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const isPortraitTopic =
    layout.mediaAspect === '3:4' ||
    layout.mediaAspect === 'portrait' ||
    layout.aspectRatio === 'portrait' ||
    /\b(person|who is|portrait|character|figure|actor|actress|author|detective|consultant|biography|protagonist|antagonist|fictional character|television character)\b/i.test(
      textCorpus
    );

  const isPortrait =
    isPortraitTopic ||
    layout.mediaAspect === '3:4' ||
    layout.mediaAspect === 'portrait' ||
    layout.aspectRatio === 'portrait';

  // Check if media is strictly a schematic blueprint, diagram, or symbol vector (never kinetic loops or photos)
  const isGraphicOrSymbol =
    !isGif &&
    (primaryMedia?.type === 'graphic' ||
      primaryMedia?.type === 'symbol' ||
      primaryMedia?.type === 'schematic' ||
      primaryMedia?.type === 'diagram');

  // Determine Structure Archetype
  const hasFormula = Boolean(node.data?.formula);
  const hasSchema = Boolean(node.data?.schemaSvg);
  const hasMedia = Boolean((primaryMedia && primaryMedia.url && !hasSchema) || (primaryMedia && isGif) || node.data?.gifSvg);

  function getDeterministicStructure(n, media, formula, schema) {
    const seed = (n.id || '') + (n.data?.title || '') + (n.data?.category || '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const posHash = Math.abs(hash);

    if (formula) {
      if (schema) {
        return posHash % 2 === 0 ? 'split_formula' : 'formula_top';
      }
      return posHash % 2 === 0 ? 'formula_top' : 'text_dossier';
    }

    if (media) {
      // With media present, rotate between visual hero presentations that showcase the visual artifact
      const archetypes = [
        'media_top',         // Photo/Simulation on top (hero banner)
        'media_bottom',      // Text first, photo below
        'split_media_right', // Photo on right, text on left (wide)
        'split_media_left',  // Photo on left, text on right (wide)
      ];
      return archetypes[posHash % archetypes.length];
    }

    return 'text_dossier';
  }

  let effectiveStructure = layout.structure || 'auto';
  if (isGif && (!layout.structure || layout.structure === 'auto' || layout.structure === 'text_dossier')) {
    effectiveStructure = 'kinetic_mechanism';
  } else if (effectiveStructure === 'auto' || effectiveStructure === 'balanced') {
    effectiveStructure = getDeterministicStructure(node, hasMedia, hasFormula, hasSchema);
  } else if (effectiveStructure === 'visual_hero') {
    effectiveStructure = 'media_top';
  } else if (effectiveStructure === 'formula_hero') {
    effectiveStructure = hasSchema ? 'split_formula' : 'formula_top';
  } else if (effectiveStructure === 'dossier') {
    effectiveStructure = hasMedia ? 'media_bottom' : 'text_dossier';
  }

  // If node has media but was assigned text_dossier, ensure the visual is not completely hidden
  if (effectiveStructure === 'text_dossier' && hasMedia) {
    effectiveStructure = isGif ? 'kinetic_mechanism' : 'media_top';
  }
  // If node was assigned a split media structure but has no media, fallback to text_dossier
  if ((effectiveStructure === 'split_media_right' || effectiveStructure === 'split_media_left') && !hasMedia) {
    effectiveStructure = 'text_dossier';
  }
  // If assigned split_formula but no formula or schema, fallback
  if (effectiveStructure === 'split_formula' && (!hasFormula || !hasSchema)) {
    effectiveStructure = hasFormula ? 'formula_top' : 'text_dossier';
  }

  // Dynamic Width Calculation based on Structure
  let dynamicWidth = layout.width || node.width;
  if (!dynamicWidth || dynamicWidth <= 340) {
    if (effectiveStructure === 'split_media_right' || effectiveStructure === 'split_media_left') {
      dynamicWidth = 460;
    } else if (effectiveStructure === 'split_formula') {
      dynamicWidth = 485;
    } else if (effectiveStructure === 'kinetic_mechanism' || isGif) {
      dynamicWidth = 410;
    } else if (effectiveStructure === 'text_dossier') {
      dynamicWidth = 360;
    } else if (effectiveStructure === 'minimal_quote') {
      dynamicWidth = 295;
    } else {
      dynamicWidth = isPortrait ? 340 : 330;
    }
  }

  // Common UI Partial Renderers
  const renderHeader = () => (
    <div className="flex items-start justify-between gap-2 pb-1.5 mb-2 border-b border-grey-medium">
      <div className="flex items-start gap-1.5 font-mono text-[9.5px] font-semibold text-text-primary uppercase leading-snug flex-1 min-w-0">
        <span className="text-amber-600 text-xs shrink-0 leading-none mt-0.5">✦</span>
        <span className="break-words" title={node.data.category || 'CREATIVE ARTIFACT'}>
          {node.data.category || 'CREATIVE ARTIFACT'}
        </span>
      </div>
      <span className="font-mono text-[7.5px] font-semibold text-text-primary bg-grey-soft border border-grey-medium px-1.5 py-0.5 rounded uppercase shrink-0 whitespace-nowrap mt-0.5">
        {node.data.status || 'ARTIFACT'}
      </span>
    </div>
  );

  const renderTitle = () => (
    <h3 className="font-display text-[13px] font-semibold text-text-primary mb-1 leading-snug line-clamp-3">
      {node.data.title || 'Synthesized Node'}
    </h3>
  );

  const renderText = (isLong = false) => {
    const content = isLong
      ? (node.data?.detailedSynthesis || node.data?.description || 'Synthesized knowledge artifact.')
      : (node.data?.description || 'Synthesized knowledge artifact.');

    return (
      <p className={`text-[9.5px] text-text-secondary leading-[1.45] mb-2.5 ${isLong ? 'line-clamp-6 whitespace-pre-line' : descClampClass}`}>
        {content}
      </p>
    );
  };

  const renderMedia = (isTopHero = false) => {
    if (!primaryMedia) return null;

    // 1. 60FPS KINETIC SIMULATION VIEWPORT
    if (isGif) {
      const inlineSvg = node.data?.gifSvg || primaryMedia?.svg;
      return (
        <div
          className={`relative bg-[#141210] border border-[#2E2824] overflow-hidden group/sim cursor-pointer select-none shadow-sm ${
            isTopHero
              ? '-mx-4 -mt-4 mb-3 rounded-t-[17px] border-b border-[#2E2824]'
              : 'rounded-xl mb-2.5 my-1'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          title="Click to inspect 60fps kinetic simulation"
        >
          <div className="w-full aspect-video min-h-[145px] max-h-[220px] flex items-center justify-center relative bg-[#141210]">
            {inlineSvg ? (
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[220px] pointer-events-none select-none"
                dangerouslySetInnerHTML={{ __html: inlineSvg }}
              />
            ) : (
              <img
                src={primaryMedia.url}
                alt={primaryMedia.title || node.data.title}
                className="w-full h-full object-contain p-0.5 group-hover/sim:scale-102 transition-transform duration-300 pointer-events-none select-none"
                draggable={false}
                loading="eager"
              />
            )}

            {/* 60FPS KINETIC LOOP Telemetry Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <div className="font-mono text-[7.5px] font-bold bg-[#0F121A]/90 text-white px-2 py-0.5 rounded shadow-xs tracking-wider flex items-center gap-1.5 shrink-0 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>60FPS KINETIC LOOP</span>
              </div>
            </div>
          </div>

          {(primaryMedia.caption || node.data?.gifCaption) && (
            <div className="px-2.5 py-1 bg-[#1A1816] border-t border-white/5 font-mono text-[8px] text-[#A8A49E] truncate">
              {primaryMedia.caption || node.data?.gifCaption}
            </div>
          )}
        </div>
      );
    }

    // 2. SCHEMATIC ARTIFACT (Strictly genuine blueprints & diagrams)
    if (isGraphicOrSymbol) {
      const isSvgGraphic = primaryMedia.url && (primaryMedia.url.endsWith('.svg') || primaryMedia.url.startsWith('data:image/svg'));
      return (
        <div className="w-full rounded-xl overflow-hidden border border-grey-medium/80 bg-[#16181D] my-1 relative shadow-inner">
          <div className="p-3 flex flex-col items-center justify-center min-h-[140px] max-h-[220px]">
            {isSvgGraphic ? (
              <img
                src={primaryMedia.url}
                alt={primaryMedia.title || 'Schematic Diagram'}
                className="w-full h-full max-h-[180px] object-contain filter invert opacity-90 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)] pointer-events-none select-none"
                draggable={false}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center font-mono text-grey-muted text-[10px]">
                <div className="text-xl mb-1">⎔</div>
                <div>{primaryMedia.title || 'Technical Schematic'}</div>
              </div>
            )}
          </div>
          <div className="px-2.5 py-1 bg-[#0F1015] border-t border-white/5 flex items-center justify-between font-mono text-[8px] text-grey-muted">
            <span className="text-amber-400/90 font-bold uppercase tracking-wider">SCHEMATIC ARTIFACT</span>
            <span className="truncate max-w-[150px]">{primaryMedia.author || primaryMedia.source || 'Archive Vector'}</span>
          </div>
        </div>
      );
    }

    // 3. PHOTOGRAPHIC ARTIFACT (100% Automatic Aspect Ratio Matching — Never Cut Off)
    const aspectStyle = naturalAspect
      ? { aspectRatio: `${naturalAspect}` }
      : { aspectRatio: isPortrait ? '3/4' : '16/9' };

    return (
      <div
        className={`relative bg-[#FAF9F6] border border-grey-medium overflow-hidden shadow-xs group/media cursor-pointer select-none ${
          isTopHero ? '-mx-4 -mt-4 mb-3 rounded-t-[17px] border-b' : 'rounded-xl mb-2.5'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onInspect?.(node.id);
        }}
        title="Click to inspect visual artifact"
      >
        <div
          className="w-full overflow-hidden flex items-center justify-center relative bg-[#ECEAE4]/30"
          style={{
            ...aspectStyle,
            maxHeight: '380px',
            minHeight: '120px',
          }}
        >
          {imageError ? (
            <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FAF9F6] to-[#ECEAE4] text-center">
              <span className="text-2xl mb-1 opacity-70">🖼️</span>
              <span className="font-mono text-[9.5px] font-semibold text-text-primary truncate max-w-[180px]">
                {node.data.title}
              </span>
              <span className="font-mono text-[7.5px] text-text-muted mt-0.5 uppercase tracking-wider">
                {node.data.category || 'Archive Visual Signal'}
              </span>
            </div>
          ) : (
            <img
              src={primaryMedia.url || ''}
              alt={primaryMedia.title || node.data.title}
              className="w-full h-full object-contain pointer-events-none select-none group-hover/media:scale-101 transition-transform duration-200"
              draggable={false}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                if (e.target.naturalWidth && e.target.naturalHeight) {
                  setNaturalAspect(e.target.naturalWidth / e.target.naturalHeight);
                }
              }}
              onError={(e) => {
                if (
                  !e.target.dataset.proxied &&
                  primaryMedia.url &&
                  !primaryMedia.url.startsWith('/api/proxy') &&
                  primaryMedia.url.startsWith('http')
                ) {
                  e.target.dataset.proxied = 'true';
                  e.target.src = `/api/proxy/image?url=${encodeURIComponent(primaryMedia.url)}`;
                } else {
                  setImageError(true);
                }
              }}
            />
          )}

          {/* Media Type Badge */}
          <div className="absolute top-2 left-2 flex items-center">
            <div className="font-mono text-[7.5px] font-bold bg-[#0F121A]/85 backdrop-blur-xs text-white px-2 py-0.5 rounded shadow-xs tracking-wider flex items-center gap-1 shrink-0">
              <span>PHOTO</span>
            </div>
          </div>
        </div>

        {primaryMedia.caption && (
          <div className="px-2.5 py-1 bg-white-warm border-t border-grey-soft font-mono text-[8px] text-text-muted truncate">
            {primaryMedia.caption}
          </div>
        )}
      </div>
    );
  };

  const renderSchema = (maxH = '130px') => {
    if (!node.data?.schemaSvg) return null;
    return (
      <div
        className="bg-[#24211E] rounded-xl mb-2.5 p-2 relative overflow-hidden flex flex-col justify-center items-center shadow-inner cursor-pointer"
        style={{
          height: maxH,
          maxHeight: '220px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onInspect?.(node.id);
        }}
        title="Click to inspect schematic"
        dangerouslySetInnerHTML={{ __html: node.data.schemaSvg }}
      />
    );
  };

  const renderFormula = () => {
    if (!node.data.formula) return null;
    return (
      <div className="bg-white-pure border border-amber-300/80 rounded-xl p-2.5 text-center mb-2.5 shadow-xs overflow-x-auto">
        {node.data.formulaType && (
          <div className="font-mono text-[7.5px] text-amber-700 font-semibold uppercase mb-1 tracking-wider">
            {node.data.formulaType}
          </div>
        )}
        <MathFormula math={node.data.formula} />
      </div>
    );
  };

  const renderInquiries = () => null;

  const renderFooter = () => (
    <div className="flex justify-between items-center font-mono text-[8px] pt-1.5 border-t border-grey-soft mt-auto">
      <span className="text-text-muted truncate max-w-[140px]">
        {node.data.source || node.data.institution || node.data.category || 'AI Synthesis // 2026'}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenBrowser?.(node.data?.url || node.data?.sourceUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(node.data?.title || '')}`);
          }}
          className="text-[#645e57] hover:text-[#2B2724] font-medium hover:underline cursor-pointer flex items-center gap-0.5 transition-colors"
          title="Open source in built-in browser"
        >
          <span>🌐</span> browser
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(node.id);
          }}
          className="text-text-primary font-semibold hover:underline cursor-pointer"
        >
          view +
        </button>
      </div>
    </div>
  );

  return (
    <SmartGlassPanel
      nodeId={node.id}
      isSelected={isSelected}
      isAnticipating={isAnticipating}
      isDragging={isDragging}
      isLinkSelected={isLinkSelected}
      isLinkShaking={isLinkShaking}
      style={{
        left: `${node.position?.x ?? 0}px`,
        top: `${node.position?.y ?? 0}px`,
        width: `${dynamicWidth}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      ariaLabel={`Spawned discovery node: ${node.data.title}`}
    >
      {/* 1. SPLIT MEDIA RIGHT (Text on Left, Photo on Right) — Horizontal Modern Layout */}
      {effectiveStructure === 'split_media_right' && (
        <div className="flex flex-row items-stretch -m-4 min-h-[220px]">
          <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
            <div>
              {renderHeader()}
              {renderTitle()}
              {renderText(true)}
              {renderInquiries()}
            </div>
            {renderFooter()}
          </div>
          <div
            className={`w-[185px] shrink-0 relative rounded-r-[17px] border-l border-grey-medium overflow-hidden cursor-pointer group/media flex items-center justify-center p-1 ${
              isGif ? 'bg-[#141210]' : 'bg-[#FAF9F6]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onInspect?.(node.id);
            }}
            title="Click to inspect media"
          >
            {imageError ? (
              <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#FAF9F6] to-[#ECEAE4] text-center">
                <span className="text-xl mb-1 opacity-70">🖼️</span>
                <span className="font-mono text-[8.5px] font-semibold text-text-primary truncate max-w-[150px]">
                  {node.data.title}
                </span>
                <span className="font-mono text-[7px] text-text-muted mt-0.5 uppercase tracking-wider">
                  {node.data.category || 'Archive Signal'}
                </span>
              </div>
            ) : isGif ? (
              (node.data?.gifSvg || primaryMedia.svg) ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none"
                  dangerouslySetInnerHTML={{ __html: node.data?.gifSvg || primaryMedia.svg }}
                />
              ) : (
                <img
                  src={primaryMedia.url || ''}
                  alt={primaryMedia.title || node.data.title}
                  className="w-full h-full object-contain p-1 group-hover/media:scale-105 transition-transform duration-300 pointer-events-none select-none"
                  draggable={false}
                  loading="eager"
                />
              )
            ) : (
              <img
                src={primaryMedia.url || ''}
                alt={primaryMedia.title || node.data.title}
                className="w-full h-full object-contain object-center p-1 group-hover/media:scale-102 transition-transform duration-300 pointer-events-none select-none"
                draggable={false}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (!e.target.dataset.proxied && primaryMedia.url && !primaryMedia.url.startsWith('/api/proxy') && primaryMedia.url.startsWith('http')) {
                    e.target.dataset.proxied = 'true';
                    e.target.src = `/api/proxy/image?url=${encodeURIComponent(primaryMedia.url)}`;
                  } else {
                    setImageError(true);
                  }
                }}
              />
            )}
            <div className="absolute top-1.5 right-1.5 font-mono text-[7px] font-bold bg-[#0F121A]/85 text-white px-1.5 py-0.5 rounded shadow-xs">
              {isGif ? '60FPS' : 'PHOTO'}
            </div>
          </div>
        </div>
      )}

      {/* 2. SPLIT MEDIA LEFT (Photo on Left, Text on Right) */}
      {effectiveStructure === 'split_media_left' && (
        <div className="flex flex-row items-stretch -m-4 min-h-[220px]">
          <div
            className={`w-[185px] shrink-0 relative rounded-l-[17px] border-r border-grey-medium overflow-hidden cursor-pointer group/media flex items-center justify-center p-1 ${
              isGif ? 'bg-[#141210]' : 'bg-[#FAF9F6]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onInspect?.(node.id);
            }}
            title="Click to inspect media"
          >
            {imageError ? (
              <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#FAF9F6] to-[#ECEAE4] text-center">
                <span className="text-xl mb-1 opacity-70">🖼️</span>
                <span className="font-mono text-[8.5px] font-semibold text-text-primary truncate max-w-[150px]">
                  {node.data.title}
                </span>
                <span className="font-mono text-[7px] text-text-muted mt-0.5 uppercase tracking-wider">
                  {node.data.category || 'Archive Signal'}
                </span>
              </div>
            ) : isGif ? (
              (node.data?.gifSvg || primaryMedia.svg) ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none"
                  dangerouslySetInnerHTML={{ __html: node.data?.gifSvg || primaryMedia.svg }}
                />
              ) : (
                <img
                  src={primaryMedia.url || ''}
                  alt={primaryMedia.title || node.data.title}
                  className="w-full h-full object-contain p-1 group-hover/media:scale-105 transition-transform duration-300 pointer-events-none select-none"
                  draggable={false}
                  loading="eager"
                />
              )
            ) : (
              <img
                src={primaryMedia.url || ''}
                alt={primaryMedia.title || node.data.title}
                className="w-full h-full object-contain object-center p-1 group-hover/media:scale-102 transition-transform duration-300 pointer-events-none select-none"
                draggable={false}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (!e.target.dataset.proxied && primaryMedia.url && !primaryMedia.url.startsWith('/api/proxy') && primaryMedia.url.startsWith('http')) {
                    e.target.dataset.proxied = 'true';
                    e.target.src = `/api/proxy/image?url=${encodeURIComponent(primaryMedia.url)}`;
                  } else {
                    setImageError(true);
                  }
                }}
              />
            )}
            <div className="absolute top-1.5 left-1.5 font-mono text-[7px] font-bold bg-[#0F121A]/85 text-white px-1.5 py-0.5 rounded shadow-xs">
              {isGif ? '60FPS' : 'PHOTO'}
            </div>
          </div>
          <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
            <div>
              {renderHeader()}
              {renderTitle()}
              {renderText(true)}
              {renderInquiries()}
            </div>
            {renderFooter()}
          </div>
        </div>
      )}

      {/* 3. MEDIA TOP (Photo Crowns the Top as Banner) */}
      {effectiveStructure === 'media_top' && (
        <>
          {renderMedia(true)}
          {renderHeader()}
          {renderTitle()}
          {renderText(false)}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}

      {/* 4. MEDIA BOTTOM (Header & Text First, Photo at the Bottom) */}
      {effectiveStructure === 'media_bottom' && (
        <>
          {renderHeader()}
          {renderTitle()}
          {renderText(false)}
          {renderMedia(false)}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}

      {/* 5. SPLIT FORMULA (Formula on Left, SVG Schematic on Right in Wide 485px Card) */}
      {effectiveStructure === 'split_formula' && (
        <>
          {renderHeader()}
          {renderTitle()}
          <div className="grid grid-cols-2 gap-2 mb-2 items-center">
            <div className="flex flex-col justify-center">
              {renderFormula()}
            </div>
            <div className="flex flex-col justify-center">
              {renderSchema('115px')}
            </div>
          </div>
          {renderText(false)}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}

      {/* 6. FORMULA TOP (Formula First, Schematic Below, Text Below) */}
      {effectiveStructure === 'formula_top' && (
        <>
          {renderHeader()}
          {renderTitle()}
          {renderFormula()}
          {renderSchema('125px')}
          {renderText(false)}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}

      {/* 7. TEXT DOSSIER (Deep Scholarly Focus, No Photos) */}
      {effectiveStructure === 'text_dossier' && (
        <>
          {renderHeader()}
          {renderTitle()}
          {renderText(true)}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}

      {/* 8. MINIMAL QUOTE (Compact Thesis Card) */}
      {effectiveStructure === 'minimal_quote' && (
        <>
          {renderHeader()}
          {renderTitle()}
          {node.data?.quote ? (
            <div className="bg-amber-500/10 border-l-2 border-amber-500 pl-2.5 py-2 my-2 font-serif italic text-[11px] text-text-primary">
              "{node.data.quote}"
            </div>
          ) : (
            renderText(true)
          )}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}

      {/* 9. KINETIC MECHANISM (Wide Mechanical Card) */}
      {effectiveStructure === 'kinetic_mechanism' && (
        <>
          {renderHeader()}
          {renderTitle()}
          {isGif ? renderMedia(false) : hasSchema ? renderSchema('140px') : renderMedia(false)}
          {renderText(false)}
          {renderInquiries()}
          {renderFooter()}
        </>
      )}
    </SmartGlassPanel>
  );
};
