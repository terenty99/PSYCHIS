import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  generateClusterHullPaths,
  autoTidyNodes,
  CLUSTER_COLOR_PALETTES,
  getClusterColor,
} from '../../utils/convexHull';
import {
  Sparkles,
  Minimize2,
  Maximize2,
  Grid,
  X,
  Check,
  Compass,
  Layers,
  Palette,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

/**
 * Compact Interactive Color Swatch Popover for Clusters
 */
const ClusterColorPicker = ({ currentColor, onSelectColor, onClose }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleDown = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener('pointerdown', handleDown);
    return () => window.removeEventListener('pointerdown', handleDown);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-2 z-50 bg-white-pure/98 backdrop-blur-xl border border-grey-strong/80 rounded-2xl p-2.5 shadow-[0_16px_36px_rgba(74,69,64,0.22)] flex flex-col gap-2 select-none animate-in fade-in zoom-in-95 duration-150 min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-1 text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider border-b border-grey-medium/50 pb-1">
        <span>Cluster Theme</span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary text-xs cursor-pointer p-0.5 rounded hover:bg-grey-soft"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 py-0.5">
        {Object.entries(CLUSTER_COLOR_PALETTES).map(([key, palette]) => {
          const isSelected = (currentColor || 'stone') === key;
          return (
            <button
              key={key}
              onClick={() => {
                onSelectColor(key);
                onClose();
              }}
              className={`group/swatch relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-text-primary ring-offset-2 scale-105 shadow-sm'
                  : 'hover:scale-110 shadow-3xs'
              }`}
              style={{ backgroundColor: palette.accent }}
              title={palette.name}
              type="button"
            >
              {isSelected ? (
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 opacity-0 group-hover/swatch:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>

      <div className="text-[9px] font-mono text-text-muted text-center pt-0.5 border-t border-grey-soft">
        {getClusterColor(currentColor).name}
      </div>
    </div>
  );
};

/**
 * Constellation Radar: Embedded micro-scale SVG diagram displaying
 * the internal spatial constellation of child nodes when a cluster is collapsed.
 */
const ConstellationRadar = ({ clusterNodes, width = 340, height = 75, accentColor = '#78716C' }) => {
  const radarData = useMemo(() => {
    if (!clusterNodes || clusterNodes.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    clusterNodes.forEach((n) => {
      const px = n.position?.x ?? 0;
      const py = n.position?.y ?? 0;
      const pw = n.width || 280;
      const ph = n.height || 220;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px + pw);
      maxY = Math.max(maxY, py + ph);
    });

    const pad = 30;
    const spanX = Math.max(maxX - minX, 100) + pad * 2;
    const spanY = Math.max(maxY - minY, 100) + pad * 2;

    const scale = Math.min((width - 24) / spanX, (height - 18) / spanY);

    const points = clusterNodes.map((n) => {
      const cx = (n.position?.x ?? 0) + (n.width || 280) / 2;
      const cy = (n.position?.y ?? 0) + (n.height || 220) / 2;
      return {
        id: n.id,
        x: 12 + (cx - (minX - pad)) * scale,
        y: 9 + (cy - (minY - pad)) * scale,
        title: n.data?.title || n.id,
      };
    });

    return points;
  }, [clusterNodes, width, height]);

  if (!radarData || radarData.length === 0) return null;

  return (
    <div className="relative w-full rounded-xl bg-white-warm/80 border border-grey-medium/60 p-2 overflow-hidden shadow-inner select-none">
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-grey-medium/50 text-[9px] font-mono text-text-muted">
        <span className="flex items-center gap-1 uppercase tracking-wider">
          <Compass className="w-2.5 h-2.5 text-text-secondary" />
          Constellation Geometry
        </span>
        <span>{radarData.length} Nodes Anchored</span>
      </div>
      <svg width={width} height={height} className="w-full h-[65px] overflow-visible">
        {/* Subtle coordinate lines */}
        <line x1="0" y1="32" x2={width} y2="32" stroke="rgba(197, 194, 188, 0.25)" strokeDasharray="3 3" />
        <line x1={width / 2} y1="0" x2={width / 2} y2={height} stroke="rgba(197, 194, 188, 0.25)" strokeDasharray="3 3" />

        {/* Dynamic linkages between adjacent nodes */}
        {radarData.map((p, i) => {
          if (i === 0) return null;
          const prev = radarData[i - 1];
          return (
            <line
              key={`link-${prev.id}-${p.id}`}
              x1={prev.x}
              y1={prev.y}
              x2={p.x}
              y2={p.y}
              stroke={accentColor}
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          );
        })}

        {/* Micro node markers with cluster accent color */}
        {radarData.map((p) => (
          <g key={p.id} className="group">
            <circle cx={p.x} cy={p.y} r="4.5" fill={accentColor} stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r="8" fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.35" />
          </g>
        ))}
      </svg>
    </div>
  );
};

/**
 * Macro-Node (Cognitive Crystal) Card rendered when cluster is collapsed.
 * Displays member images, rich member summaries, constellation radar, and color controls.
 */
const MacroNodeCard = ({
  cluster,
  index,
  clusterNodes,
  onToggleCollapse,
  onDissolve,
  onUpdateColor,
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorConfig = getClusterColor(cluster.color);

  // Compute centroid based on child nodes positions
  const centroid = useMemo(() => {
    if (!clusterNodes || clusterNodes.length === 0) return { x: 300, y: 200 };
    let sx = 0,
      sy = 0;
    clusterNodes.forEach((n) => {
      sx += (n.position?.x ?? 0) + (n.width || 280) / 2;
      sy += (n.position?.y ?? 0) + (n.height || 220) / 2;
    });
    return {
      x: Math.round(sx / clusterNodes.length) - 185,
      y: Math.round(sy / clusterNodes.length) - 130,
    };
  }, [clusterNodes]);

  // Extract all valid media (photos, GIFs, simulations) from member nodes
  const memberMedia = useMemo(() => {
    const list = [];
    clusterNodes.forEach((node) => {
      const photo =
        (node.data?.gifUrl
          ? { url: node.data.gifUrl, type: 'gif', title: node.data.title }
          : null) ||
        node.data?.primaryPhoto ||
        (Array.isArray(node.data?.photos) && node.data.photos[0]) ||
        (Array.isArray(node.data?.media) && node.data.media.find((m) => m.url)) ||
        null;

      if (photo && (photo.url || photo.svg)) {
        list.push({
          nodeId: node.id,
          nodeTitle: node.data?.title || 'Visual Artifact',
          nodeCategory: node.data?.category,
          ...photo,
        });
      }
    });
    return list;
  }, [clusterNodes]);

  // Extract member nodes text summaries
  const memberSummaries = useMemo(() => {
    return clusterNodes.map((node) => {
      const title = node.data?.title || 'Untitled Node';
      const category = node.data?.category || 'Artifact';
      const text =
        node.data?.description ||
        node.data?.detailedSynthesis ||
        (Array.isArray(node.data?.takeaways) && node.data.takeaways[0]) ||
        node.data?.formula ||
        '';
      return {
        id: node.id,
        title,
        category,
        text,
      };
    });
  }, [clusterNodes]);

  const coherence = Math.round((cluster.coherenceScore || 0.96) * 100);

  return (
    <div
      data-macro-node-id={cluster.id}
      id={`macro-node-${cluster.id}`}
      style={{
        transform: `translate(${centroid.x}px, ${centroid.y}px)`,
        width: '370px',
        borderColor: colorConfig.strokeDark,
        boxShadow: `0 20px 48px ${colorConfig.glow}, 0 2px 10px rgba(0,0,0,0.06)`,
      }}
      className="absolute z-25 pointer-events-auto bg-white-pure/98 backdrop-blur-xl border-2 rounded-3xl p-4 flex flex-col gap-3 select-none animate-in zoom-in-95 duration-200"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-grey-medium/70">
        <div className="flex items-center gap-2 overflow-hidden relative">
          {/* Color Dot Button triggers color picker */}
          <button
            type="button"
            onClick={() => setIsColorPickerOpen((prev) => !prev)}
            className="w-3.5 h-3.5 rounded-full shrink-0 hover:scale-125 transition-transform cursor-pointer shadow-xs ring-1 ring-black/10"
            style={{ backgroundColor: colorConfig.accent }}
            title={`Cluster Color: ${colorConfig.name} (Click to change)`}
          />

          {isColorPickerOpen && (
            <ClusterColorPicker
              currentColor={cluster.color}
              onSelectColor={(key) => onUpdateColor?.(cluster.id, key)}
              onClose={() => setIsColorPickerOpen(false)}
            />
          )}

          <div className="flex flex-col truncate">
            <span className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-wider">
              § {String(index + 1).padStart(2, '0')} · Macro-Node ({clusterNodes.length} nodes)
            </span>
            <span className="font-display text-[13.5px] font-bold text-text-primary truncate">
              {cluster.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Palette button */}
          <button
            onClick={() => setIsColorPickerOpen((prev) => !prev)}
            className="w-7 h-7 rounded-xl hover:bg-grey-soft text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
            title="Choose Cluster Color"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Expand Cluster [+] */}
          <button
            onClick={() => onToggleCollapse(cluster.id)}
            className="w-7 h-7 rounded-xl bg-text-primary text-white hover:bg-black flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer"
            title="Expand Cluster (+)"
            aria-label="Expand Cluster"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex items-center gap-2 font-mono text-[9.5px]">
        <span
          className="px-2 py-0.5 rounded-full border font-semibold truncate"
          style={{
            backgroundColor: colorConfig.badgeBg,
            color: colorConfig.badgeText,
            borderColor: colorConfig.stroke,
          }}
        >
          {cluster.category || 'Spatial Constellation'}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-grey-soft text-text-secondary border border-grey-medium/60 font-semibold shrink-0">
          {coherence}% Coherence
        </span>
      </div>

      {/* Visual Artifacts Strip (Member Photos/GIFs) */}
      {memberMedia.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-text-muted uppercase tracking-wider">
            <ImageIcon className="w-3 h-3 text-text-secondary" />
            <span>Visual Artifacts ({memberMedia.length})</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {memberMedia.map((m, mIdx) => (
              <div
                key={m.id || m.url || mIdx}
                className="relative w-28 h-20 rounded-xl overflow-hidden border border-grey-medium shrink-0 bg-[#FAF9F6] shadow-3xs group/thumb"
                title={`${m.nodeTitle} (${m.nodeCategory || 'Artifact'})`}
              >
                {m.type === 'gif' ? (
                  <div className="w-full h-full bg-[#141210] flex items-center justify-center">
                    <img
                      src={m.url}
                      alt={m.title || m.nodeTitle}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt={m.title || m.nodeTitle}
                    className="w-full h-full object-cover pointer-events-none select-none group-hover/thumb:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1">
                  <p className="font-mono text-[8px] text-white truncate font-medium">
                    {m.nodeTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Node Excerpts / Text Dossiers */}
      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
        {memberSummaries.map((item) => (
          <div
            key={item.id}
            className="p-2 rounded-xl bg-white-warm/85 border border-grey-medium/60 text-[11px] flex flex-col gap-0.5"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-display font-bold text-text-primary text-[11.5px] truncate">
                {item.title}
              </span>
              <span className="font-mono text-[8px] px-1.5 py-0.2 rounded bg-grey-soft text-text-muted shrink-0">
                {item.category}
              </span>
            </div>
            {item.text && (
              <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed font-sans">
                {item.text}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Constellation Radar miniature */}
      <ConstellationRadar
        clusterNodes={clusterNodes}
        width={336}
        height={65}
        accentColor={colorConfig.accent}
      />

      {/* Quick controls */}
      <div className="flex items-center justify-between pt-1 border-t border-grey-soft font-mono text-[10px]">
        <span className="text-text-muted">
          {clusterNodes.length} nodes integrated
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDissolve(cluster.id)}
            className="text-text-muted hover:text-red-600 cursor-pointer transition-colors px-1 py-0.5"
            title="Ungroup / Dissolve Cluster"
          >
            Dissolve (×)
          </button>
          <button
            onClick={() => onToggleCollapse(cluster.id)}
            className="btn-contemplative !py-1 !px-2.5 text-[10.5px] font-semibold"
          >
            Expand [+]
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Single Active Cluster Membrane Component
 */
const SingleClusterHull = ({
  cluster,
  index,
  nodes,
  measuredDims,
  onToggleCollapse,
  onAutoTidy,
  onDissolve,
  onUpdateTitle,
  onUpdateColor,
  onAdoptGhost,
  onDismissGhost,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(cluster.title || '');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const titleInputRef = useRef(null);

  // 1. Filter child nodes (unconditional hook)
  const clusterNodes = useMemo(() => {
    const ids = new Set(cluster.nodeIds || []);
    return nodes.filter((n) => ids.has(n.id));
  }, [nodes, cluster.nodeIds]);

  // 2. Smoothed organic convex hull geometry calculation (unconditional hook)
  const hullData = useMemo(() => {
    if (clusterNodes.length === 0 || cluster.isCollapsed) return null;
    return generateClusterHullPaths(clusterNodes, measuredDims);
  }, [clusterNodes, measuredDims, cluster.isCollapsed]);

  // 3. Sync title input (unconditional hook)
  useEffect(() => {
    setTitleInput(cluster.title || '');
  }, [cluster.title]);

  // 4. Focus ref when renaming (unconditional hook)
  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  // ALL HOOKS ARE ABOVE. Now we can conditionally render the Macro-Node card if collapsed
  if (cluster.isCollapsed) {
    return (
      <MacroNodeCard
        cluster={cluster}
        index={index}
        clusterNodes={clusterNodes}
        onToggleCollapse={onToggleCollapse}
        onDissolve={onDissolve}
        onUpdateColor={onUpdateColor}
      />
    );
  }

  if (!hullData) return null;

  const { outerPath, innerPath, headerPos } = hullData;
  const isGhost = Boolean(cluster.isGhost);
  const coherence = Math.round((cluster.coherenceScore || 0.94) * 100);
  const colorConfig = getClusterColor(cluster.color);

  const handleSaveTitle = (e) => {
    e?.preventDefault();
    const clean = titleInput.trim();
    if (clean && clean !== cluster.title) {
      onUpdateTitle?.(cluster.id, clean);
    }
    setIsEditingTitle(false);
  };

  return (
    <>
      {/* SVG Membrane Hull */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id={`hull-shadow-${cluster.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor={colorConfig.glow} />
          </filter>
        </defs>

        {/* Outer Organic Smoothed Convex Hull Path */}
        <path
          d={outerPath}
          fill={isGhost ? 'rgba(254, 243, 199, 0.22)' : colorConfig.fill}
          stroke={isGhost ? '#D97706' : colorConfig.stroke}
          strokeWidth={isGhost ? '1.8' : '1.5'}
          strokeDasharray={isGhost ? '7 5' : 'none'}
          filter={`url(#hull-shadow-${cluster.id})`}
          className={`transition-all duration-300 ease-out ${isGhost ? 'animate-pulse' : ''}`}
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        />

        {/* Secondary Concentric Topographic Isoline */}
        <path
          d={innerPath}
          fill="none"
          stroke={isGhost ? 'rgba(217, 119, 6, 0.4)' : colorConfig.isoline}
          strokeWidth="1.1"
          strokeDasharray="4 4"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Architectural Header & Controls Pill */}
      {isGhost ? (
        /* Ghost Hull Provisional Action Pill */
        <div
          className="absolute z-20 font-mono text-[11px] font-semibold text-text-primary bg-white-pure/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-amber-500 flex items-center gap-2.5 shadow-[0_8px_24px_rgba(217,119,6,0.18)] pointer-events-auto select-none transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{
            top: `${headerPos.y}px`,
            left: `${headerPos.x}px`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-text-primary font-bold">
            Proposed Cluster: &ldquo;{cluster.title}&rdquo; ({cluster.nodeIds?.length || 3} nodes)
          </span>

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => onAdoptGhost?.(cluster)}
              className="px-2.5 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
              title="Accept & Form Permanent Cluster"
            >
              <Check className="w-3 h-3" />
              <span>Adopt</span>
            </button>
            <button
              onClick={() => onDismissGhost?.(cluster.id)}
              className="px-2 py-0.5 rounded-md bg-grey-soft hover:bg-grey-medium text-text-secondary font-mono text-[10px] transition-colors cursor-pointer"
              title="Dismiss Suggestion"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        /* Permanent Architectural Header Pill with Dynamic Cluster Colors */
        <div
          className="absolute z-20 font-mono text-[11px] font-semibold text-text-primary backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm pointer-events-auto select-none transition-all duration-200 group"
          style={{
            top: `${headerPos.y}px`,
            left: `${headerPos.x}px`,
            backgroundColor: colorConfig.pillBg,
            border: `1.5px solid ${colorConfig.pillBorder}`,
          }}
        >
          {/* Color Indicator Dot triggers Color Picker Popover */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="w-3 h-3 rounded-full hover:scale-125 transition-transform cursor-pointer shadow-xs ring-1 ring-black/15"
              style={{ backgroundColor: colorConfig.accent }}
              title={`Cluster Color: ${colorConfig.name} (Click to change)`}
            />

            {isColorPickerOpen && (
              <ClusterColorPicker
                currentColor={cluster.color}
                onSelectColor={(key) => onUpdateColor?.(cluster.id, key)}
                onClose={() => setIsColorPickerOpen(false)}
              />
            )}
          </div>

          {/* Inline Editable Title */}
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setTitleInput(cluster.title || '');
                    setIsEditingTitle(false);
                  }
                }}
                className="font-sans font-bold text-xs text-text-primary bg-white-warm border border-text-primary rounded px-1.5 py-0.5 outline-none select-text"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="font-sans font-bold text-[12px] text-text-primary hover:underline cursor-pointer truncate max-w-[240px] text-left"
              title="Click to rename cluster"
            >
              § {String(index + 1).padStart(2, '0')} · {cluster.title}
            </button>
          )}

          {/* Category Badge */}
          {cluster.category && (
            <span
              className="hidden sm:inline-block font-mono text-[9px] px-2 py-0.5 rounded-full border truncate max-w-[130px]"
              style={{
                backgroundColor: colorConfig.badgeBg,
                color: colorConfig.badgeText,
                borderColor: colorConfig.stroke,
              }}
            >
              {cluster.category}
            </span>
          )}

          {/* Coherence Badge */}
          <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-white/70 text-text-secondary border border-grey-medium/50 font-medium">
            {coherence}%
          </span>

          {/* Controls: Collapse, Color, Auto-Tidy, Dissolve */}
          <div className="flex items-center gap-1 pl-1 border-l border-grey-medium/70">
            {/* Collapse [-] */}
            <button
              onClick={() => onToggleCollapse?.(cluster.id)}
              className="w-5 h-5 rounded-md hover:bg-black/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Collapse into Macro-Node (-)"
              aria-label="Collapse cluster"
            >
              <Minimize2 className="w-3 h-3" />
            </button>

            {/* Color Palette Popover Trigger */}
            <button
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="w-5 h-5 rounded-md hover:bg-black/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Choose Cluster Color"
              aria-label="Choose Cluster Color"
            >
              <Palette className="w-3 h-3" />
            </button>

            {/* Auto-Tidy [⇄] */}
            <button
              onClick={() => onAutoTidy?.(cluster.id)}
              className="w-5 h-5 rounded-md hover:bg-black/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Auto-Tidy Golden-Ratio Layout"
              aria-label="Tidy cluster"
            >
              <Grid className="w-3 h-3" />
            </button>

            {/* Ungroup / Dissolve [×] */}
            <button
              onClick={() => onDissolve?.(cluster.id)}
              className="w-5 h-5 rounded-md hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
              title="Dissolve / Ungroup Cluster (Ctrl+Shift+G)"
              aria-label="Dissolve cluster"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * ConvexHull Master Component
 * Supports multiple concurrent clusters, collapsed Macro-Nodes, dynamic color theming, and provisional Ghost Hulls.
 */
export const ConvexHull = ({
  clusters = [],
  ghostClusters = [],
  nodes = [],
  measuredDims = {},
  onToggleCollapse,
  onAutoTidy,
  onDissolve,
  onUpdateTitle,
  onUpdateColor,
  onAdoptGhost,
  onDismissGhost,
  // Backward compatibility fallback props:
  bounds,
  label,
  isCollapsed = false,
  onToggleClusterCollapse,
}) => {
  // If modern clusters array is provided, render all clusters
  if (Array.isArray(clusters) && clusters.length > 0) {
    const combined = [...clusters, ...(ghostClusters || [])];

    return (
      <>
        {combined.map((cluster, idx) => (
          <SingleClusterHull
            key={cluster.id || `cluster-${idx}`}
            cluster={cluster}
            index={idx}
            nodes={nodes}
            measuredDims={measuredDims}
            onToggleCollapse={onToggleCollapse}
            onAutoTidy={onAutoTidy}
            onDissolve={onDissolve}
            onUpdateTitle={onUpdateTitle}
            onUpdateColor={onUpdateColor}
            onAdoptGhost={onAdoptGhost}
            onDismissGhost={onDismissGhost}
          />
        ))}
      </>
    );
  }

  // Backward-compatibility fallback if only single legacy bounds passed
  if (!bounds) return null;

  return (
    <>
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-10" aria-hidden="true">
        <rect
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          rx="22"
          fill="rgba(232, 230, 227, 0.18)"
          stroke="var(--grey-strong)"
          strokeWidth="1.4"
          strokeDasharray="8 6"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      <div
        className="fixed z-20 font-mono text-[10.5px] font-semibold text-text-primary bg-white-pure/95 backdrop-blur-md px-3 py-1 rounded-full border border-grey-strong flex items-center gap-2 shadow-xs pointer-events-auto select-none transition-all duration-300"
        style={{
          top: `${bounds.y + 6}px`,
          left: `${bounds.x + 14}px`,
        }}
      >
        <span className="w-2 h-2 rounded-full bg-text-secondary" aria-hidden="true" />
        <span>{label || 'Spatial Cluster'}</span>
        <button
          onClick={onToggleClusterCollapse}
          className="btn-contemplative !px-2 !py-0 text-[10px] rounded-md h-4 min-w-4 font-mono font-bold"
          aria-label={isCollapsed ? 'Expand cluster' : 'Collapse cluster'}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>
    </>
  );
};
