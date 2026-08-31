import React, { useState } from 'react';
import { LINKAGE_DEFINITIONS } from '../../utils/nodeTemplates';
import { MathFormula } from '../../utils/mathRenderer';
import { Network, Info, ArrowRight } from 'lucide-react';

export const OrganicLinkageLayer = ({ edges = [] }) => {
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handlePointerEnter = (edge, e) => {
    setHoveredEdge(edge);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (hoveredEdge) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerLeave = () => {
    setHoveredEdge(null);
  };

  const activeDef = hoveredEdge
    ? LINKAGE_DEFINITIONS[hoveredEdge.relationshipType] || LINKAGE_DEFINITIONS.DEFAULT
    : null;

  return (
    <>
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-15"
        aria-hidden="true"
        onPointerMove={handlePointerMove}
      >
        <defs>
          {/* Main high-visibility linkage gradient */}
          <linearGradient id="linkage-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C5C2BC" stopOpacity="0.4" />
            <stop offset="15%" stopColor="#8A8782" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#4A4540" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#8A8782" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#C5C2BC" stopOpacity="0.4" />
          </linearGradient>

          {/* Contradiction high-visibility gradient */}
          <linearGradient id="contradiction-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A8A49E" stopOpacity="0.5" />
            <stop offset="25%" stopColor="#6B655A" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#3A3530" stopOpacity="1" />
            <stop offset="75%" stopColor="#6B655A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A8A49E" stopOpacity="0.5" />
          </linearGradient>

          {/* Highlighted hover gradient */}
          <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A4540" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1E1B18" stopOpacity="1" />
            <stop offset="100%" stopColor="#4A4540" stopOpacity="0.8" />
          </linearGradient>

          {/* Tactile noise filter */}
          <filter id="gentle-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.2" />
          </filter>
        </defs>

        {/* 1. White Glow Underlays */}
        {edges.map((edge) => {
          const isHovered = hoveredEdge?.id === edge.id;
          return (
            <path
              key={`glow-${edge.id}`}
              d={edge.d}
              className="edge-glow"
              style={{
                strokeWidth: isHovered ? '10px' : '6px',
                stroke: isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)',
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}

        {/* 2. Main Organic Linkage Paths */}
        {edges.map((edge) => {
          const isContra = edge.relationshipType === 'CONTRADICTS';
          const isHovered = hoveredEdge?.id === edge.id;

          return (
            <g key={`group-${edge.id}`}>
              {/* Invisible thick hit-box stroke for easy hovering */}
              <path
                d={edge.d}
                fill="none"
                stroke="transparent"
                strokeWidth="18"
                className="pointer-events-auto cursor-pointer"
                onPointerEnter={(e) => handlePointerEnter(edge, e)}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              />

              {/* Visible rendered stroke */}
              <path
                d={edge.d}
                stroke={isHovered ? 'url(#highlight-gradient)' : isContra ? 'url(#contradiction-gradient)' : 'url(#linkage-gradient)'}
                strokeDasharray={isContra ? '6 4' : 'none'}
                strokeWidth={isHovered ? 4 : 2.8}
                className="organic-linkage pointer-events-none"
                filter="url(#gentle-noise)"
                style={{
                  filter: isHovered ? 'drop-shadow(0 2px 8px rgba(74, 69, 64, 0.35))' : 'drop-shadow(0 1px 3px rgba(74, 69, 64, 0.15))',
                  transition: 'all 0.2s ease',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* 3. Floating Semantic Chips (Hoverable) */}
      {edges.map((edge) => {
        if (!edge.label || !edge.midpoint) return null;
        const isHovered = hoveredEdge?.id === edge.id;

        return (
          <div
            key={`chip-${edge.id}`}
            onPointerEnter={(e) => handlePointerEnter(edge, e)}
            onPointerLeave={handlePointerLeave}
            className={`organic-chip pointer-events-auto cursor-pointer transition-all duration-200 ${
              isHovered ? '!bg-text-primary !text-white-pure !border-text-primary scale-110 !shadow-lg' : ''
            }`}
            style={{
              left: `${edge.midpoint.x}px`,
              top: `${edge.midpoint.y}px`,
            }}
          >
            {edge.label}
          </div>
        );
      })}

      {/* 4. Enlightened Hover Tooltip Card */}
      {hoveredEdge && activeDef && (
        <div
          className="fixed z-50 pointer-events-none bg-white-pure/98 backdrop-blur-2xl border border-grey-strong rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] w-[290px] text-xs font-sans transition-opacity duration-150 animate-in fade-in"
          style={{
            left: `${Math.min(mousePos.x + 14, window.innerWidth - 310)}px`,
            top: `${Math.min(mousePos.y + 14, window.innerHeight - 200)}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-grey-medium">
            <span className="font-mono text-[9.5px] font-semibold text-text-secondary flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-text-secondary" />
              {activeDef.badge}
            </span>
            <span className="font-mono text-[9px] font-semibold text-text-primary bg-grey-soft border border-grey-medium px-2 py-0.5 rounded-full">
              {hoveredEdge.label}
            </span>
          </div>

          <div className="font-display text-[13px] font-semibold text-text-primary mb-1">
            {activeDef.name}
          </div>

          <p className="text-[11px] text-text-secondary leading-[1.55] mb-2.5">
            {activeDef.description}
          </p>

          {/* Mathematical Context */}
          {activeDef.mathematics && (
            <div className="bg-white-warm border border-grey-medium rounded-xl p-1.5 text-center mb-2 shadow-xs">
              <MathFormula math={activeDef.mathematics} inline />
            </div>
          )}

          <div className="flex justify-between items-center font-mono text-[9px] text-text-muted pt-1 border-t border-grey-soft">
            <span>COUPLING</span>
            <b className="text-text-primary">{activeDef.coupling}</b>
          </div>
        </div>
      )}
    </>
  );
};
