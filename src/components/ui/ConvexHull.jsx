import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  generateClusterHullPaths,
  autoTidyNodes,
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
  ChevronRight,
} from 'lucide-react';

/**
 * Constellation Radar: Embedded micro-scale SVG diagram displaying
 * the internal spatial constellation of child nodes when a cluster is collapsed.
 */
const ConstellationRadar = ({ clusterNodes, width = 290, height = 75 }) => {
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
    <div className="relative w-full rounded-xl bg-white-warm/90 border border-grey-medium/70 p-2 overflow-hidden shadow-inner select-none">
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-grey-medium/50 text-[9px] font-mono text-text-muted">
        <span className="flex items-center gap-1 uppercase tracking-wider">
          <Compass className="w-2.5 h-2.5 text-text-secondary" />
          Constellation Radar
        </span>
        <span>{radarData.length} Nodes Anchored</span>
      </div>
      <svg width={width} height={height} className="w-full h-[70px] overflow-visible">
        {/* Subtle mesh grid lines */}
        <line x1="0" y1="35" x2={width} y2="35" stroke="rgba(197, 194, 188, 0.25)" strokeDasharray="3 3" />
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
              stroke="#A8A49E"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Micro node markers */}
        {radarData.map((p) => (
          <g key={p.id} className="group">
            <circle cx={p.x} cy={p.y} r="4.5" fill="#4A4540" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#6B655A" strokeWidth="0.8" opacity="0.4" />
          </g>
        ))}
      </svg>
    </div>
  );
};

/**
 * Macro-Node (Cognitive Crystal) Card rendered when cluster is collapsed.
 */
const MacroNodeCard = ({
  cluster,
  index,
  clusterNodes,
  onToggleCollapse,
  onSynthesize,
  onDissolve,
}) => {
  // Centroid
  const centroid = useMemo(() => {
    if (!clusterNodes || clusterNodes.length === 0) return { x: 300, y: 200 };
    let sx = 0,
      sy = 0;
    clusterNodes.forEach((n) => {
      sx += (n.position?.x ?? 0) + (n.width || 280) / 2;
      sy += (n.position?.y ?? 0) + (n.height || 220) / 2;
    });
    return {
      x: Math.round(sx / clusterNodes.length) - 165,
      y: Math.round(sy / clusterNodes.length) - 120,
    };
  }, [clusterNodes]);

  const coherence = Math.round((cluster.coherenceScore || 0.96) * 100);

  return (
    <div
      data-macro-node-id={cluster.id}
      id={`macro-node-${cluster.id}`}
      style={{
        transform: `translate(${centroid.x}px, ${centroid.y}px)`,
        width: '330px',
      }}
      className="absolute z-25 pointer-events-auto bg-white-pure/95 backdrop-blur-xl border-2 border-grey-strong rounded-3xl p-4 shadow-[0_20px_50px_rgba(74,69,64,0.16)] flex flex-col gap-3 select-none animate-in zoom-in-95 duration-200"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-grey-medium">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
          <div className="flex flex-col truncate">
            <span className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-wider">
              § {String(index + 1).padStart(2, '0')} · Macro-Node
            </span>
            <span className="font-display text-[13px] font-bold text-text-primary truncate">
              {cluster.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
        <span className="px-2 py-0.5 rounded-full bg-grey-soft text-text-secondary border border-grey-medium/60 truncate">
          {cluster.category || 'Constellation'}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
          {coherence}% Coherence
        </span>
      </div>

      {/* Constellation Radar miniature */}
      <ConstellationRadar clusterNodes={clusterNodes} width={298} height={72} />

      {/* Synthesized abstract / bullets */}
      <div className="bg-white-warm/80 border border-grey-medium/60 rounded-xl p-2.5 text-[11px] text-text-secondary font-sans leading-relaxed line-clamp-3">
        {cluster.aiSynthesizedSummary ||
          `Consolidated epistemic biome integrating ${cluster.nodeIds.length} foundational knowledge nodes.`}
      </div>

      {/* Quick controls */}
      <div className="flex items-center justify-between pt-1 border-t border-grey-soft font-mono text-[10px]">
        <button
          onClick={() => onSynthesize(cluster.id)}
          className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Deep Dive</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDissolve(cluster.id)}
            className="text-text-muted hover:text-red-600 cursor-pointer transition-colors"
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
  onSynthesize,
  onAutoTidy,
  onDissolve,
  onUpdateTitle,
  onAdoptGhost,
  onDismissGhost,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(cluster.title || '');
  const titleInputRef = useRef(null);

  // Filter child nodes
  const clusterNodes = useMemo(() => {
    const ids = new Set(cluster.nodeIds || []);
    return nodes.filter((n) => ids.has(n.id));
  }, [nodes, cluster.nodeIds]);

  // If collapsed, render Macro-Node card instead of full membrane
  if (cluster.isCollapsed) {
    return (
      <MacroNodeCard
        cluster={cluster}
        index={index}
        clusterNodes={clusterNodes}
        onToggleCollapse={onToggleCollapse}
        onSynthesize={onSynthesize}
        onDissolve={onDissolve}
      />
    );
  }

  // Calculate smoothed organic convex hull paths
  const hullData = useMemo(() => {
    if (clusterNodes.length === 0) return null;
    return generateClusterHullPaths(clusterNodes, measuredDims);
  }, [clusterNodes, measuredDims]);

  useEffect(() => {
    setTitleInput(cluster.title || '');
  }, [cluster.title]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  if (!hullData) return null;

  const { outerPath, innerPath, headerPos } = hullData;
  const isGhost = Boolean(cluster.isGhost);
  const coherence = Math.round((cluster.coherenceScore || 0.94) * 100);

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
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="rgba(74, 69, 64, 0.08)" />
          </filter>
        </defs>

        {/* Outer Organic Smoothed Convex Hull Path */}
        <path
          d={outerPath}
          fill={isGhost ? 'rgba(254, 243, 199, 0.22)' : 'rgba(245, 244, 242, 0.55)'}
          stroke={isGhost ? '#D97706' : 'rgba(197, 194, 188, 0.85)'}
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
          stroke={isGhost ? 'rgba(217, 119, 6, 0.4)' : 'rgba(197, 194, 188, 0.45)'}
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
            AI Proposed Cluster: &ldquo;{cluster.title}&rdquo; ({cluster.nodeIds?.length || 3} nodes)
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
        /* Permanent Architectural Header Pill */
        <div
          className="absolute z-20 font-mono text-[11px] font-semibold text-text-primary bg-white-pure/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-grey-strong flex items-center gap-2.5 shadow-sm pointer-events-auto select-none transition-all duration-200 group hover:border-text-primary"
          style={{
            top: `${headerPos.y}px`,
            left: `${headerPos.x}px`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-text-secondary shrink-0" />

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
              title="Click or press F2 to rename cluster"
            >
              § {String(index + 1).padStart(2, '0')} · {cluster.title}
            </button>
          )}

          {/* Epistemic Badge */}
          {cluster.category && (
            <span className="hidden sm:inline-block font-mono text-[9px] px-2 py-0.5 rounded-full bg-grey-soft text-text-muted border border-grey-medium/60 truncate max-w-[130px]">
              {cluster.category}
            </span>
          )}

          {/* Coherence Badge */}
          <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-grey-soft/80 text-text-secondary border border-grey-medium/50 font-medium">
            {coherence}%
          </span>

          {/* Controls: Collapse, Synthesize, Auto-Tidy, Dissolve */}
          <div className="flex items-center gap-1 pl-1 border-l border-grey-medium">
            {/* Collapse [-] */}
            <button
              onClick={() => onToggleCollapse?.(cluster.id)}
              className="w-5 h-5 rounded-md hover:bg-grey-soft flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Collapse into Macro-Node (-)"
              aria-label="Collapse cluster"
            >
              <Minimize2 className="w-3 h-3" />
            </button>

            {/* AI Synthesize [✦] */}
            <button
              onClick={() => onSynthesize?.(cluster.id)}
              className="w-5 h-5 rounded-md hover:bg-amber-50 hover:text-amber-700 flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
              title="AI Cluster Deep Dive (Synthesize)"
              aria-label="Synthesize cluster"
            >
              <Sparkles className="w-3 h-3" />
            </button>

            {/* Auto-Tidy [⇄] */}
            <button
              onClick={() => onAutoTidy?.(cluster.id)}
              className="w-5 h-5 rounded-md hover:bg-grey-soft flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
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
 * Supports multiple concurrent clusters, collapsed Macro-Nodes, and provisional Ghost Hulls.
 */
export const ConvexHull = ({
  clusters = [],
  ghostClusters = [],
  nodes = [],
  measuredDims = {},
  onToggleCollapse,
  onSynthesize,
  onAutoTidy,
  onDissolve,
  onUpdateTitle,
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
            onSynthesize={onSynthesize}
            onAutoTidy={onAutoTidy}
            onDissolve={onDissolve}
            onUpdateTitle={onUpdateTitle}
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
