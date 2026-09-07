import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MathFormula } from '../../utils/mathRenderer';
import { LINKAGE_PALETTE } from './LinkageOptionsPopover';

export const OrganicLinkageLayer = ({
  edges = [],
  isCtrlDown = false,
  onEdgeClick,
  onCutEdge,
}) => {
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Immediately reset hoveredEdge if the edge was deleted or no longer exists in edges
  useEffect(() => {
    if (hoveredEdge && !edges.some((e) => e.id === hoveredEdge.id)) {
      setHoveredEdge(null);
    }
  }, [edges, hoveredEdge]);

  // 2. Global safety: dismiss hover card when pointer moves off linkage hitboxes or chips
  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      try {
        if (!e.target || typeof e.target.closest !== 'function' || !e.target.closest('.linkage-hitbox, .organic-chip')) {
          setHoveredEdge(null);
        }
      } catch {
        setHoveredEdge(null);
      }
    };

    const handleClear = () => setHoveredEdge(null);

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('blur', handleClear);
    window.addEventListener('wheel', handleClear, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('blur', handleClear);
      window.removeEventListener('wheel', handleClear);
    };
  }, []);

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

  // Helper to find matching SVG arrow marker ID for a given color
  const getMarkerId = (color) => {
    if (!color) return 'arrow-default';
    const match = LINKAGE_PALETTE.find((p) => p.hex.toLowerCase() === color.toLowerCase());
    return match ? `arrow-${match.id}` : 'arrow-default';
  };

  // Ensure activeHoveredEdge is strictly present in the current edges list
  const activeHoveredEdge = hoveredEdge && edges.some((e) => e.id === hoveredEdge.id)
    ? hoveredEdge
    : null;

  return (
    <>
      <svg
        id="svg-linkage-layer"
        className={`absolute inset-0 pointer-events-none ${isCtrlDown ? 'is-cut-mode' : 'z-15'}`}
        style={{ width: '5000px', height: '4000px', overflow: 'visible' }}
      >
        <defs>
          {LINKAGE_PALETTE.map((p) => (
            <marker
              key={`arrow-${p.id}`}
              id={`arrow-${p.id}`}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={p.hex} />
            </marker>
          ))}
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7A7570" />
          </marker>
        </defs>

        {/* 1. White Glow Underlays */}
        {edges.map((edge) => (
          <path
            key={`glow-${edge.id}`}
            d={edge.d}
            fill="none"
            className="linkage-glow"
          />
        ))}

        {/* 2. Main Organic Linkage Paths */}
        {edges.map((edge) => {
          const isHovered = activeHoveredEdge?.id === edge.id;
          const isCutHovered = isHovered && isCtrlDown;

          const baseColor = edge.color || (edge.relationshipType === 'CONTRADICTS' ? '#3A3530' : '#7A7570');
          const strokeColor = isCutHovered ? '#EF4444' : baseColor;

          // Line dash styling
          let dashArray = undefined;
          if (edge.style === 'dashed') {
            dashArray = '8 6';
          } else if (edge.style === 'dotted') {
            dashArray = '3 4';
          } else if (edge.relationshipType === 'CONTRADICTS') {
            dashArray = '6 5';
          }

          // Directional Arrow marker
          const hasArrow = edge.style === 'arrowed';
          const markerEnd = hasArrow ? `url(#${getMarkerId(baseColor)})` : undefined;

          return (
            <g key={`group-${edge.id}`}>
              {/* Invisible thick hit-box stroke for easy hovering and clicking */}
              <path
                d={edge.d}
                fill="none"
                stroke="transparent"
                strokeWidth="24"
                className="linkage-hitbox pointer-events-auto cursor-pointer"
                style={{ cursor: isCtrlDown ? 'crosshair' : 'pointer' }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerEnter={(e) => handlePointerEnter(edge, e)}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.ctrlKey || e.metaKey || isCtrlDown) {
                    setHoveredEdge(null);
                    onCutEdge?.(edge.id);
                  } else {
                    onEdgeClick?.(edge);
                  }
                }}
              />

              {/* Visible rendered stroke */}
              <path
                d={edge.d}
                fill="none"
                stroke={strokeColor}
                strokeDasharray={dashArray}
                markerEnd={markerEnd}
                className={`linkage-path ${isCutHovered ? 'is-cut-hovered' : ''}`}
                style={{
                  stroke: strokeColor,
                  strokeDasharray: isCutHovered ? '6 4' : dashArray,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* 3. Floating Small Window Chips (Shown only if label is non-empty) */}
      {edges.map((edge) => {
        if (!edge.label || !edge.label.trim() || !edge.midpoint) return null;
        const isHovered = activeHoveredEdge?.id === edge.id;

        return (
          <div
            key={`chip-${edge.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerEnter={(e) => handlePointerEnter(edge, e)}
            onPointerLeave={handlePointerLeave}
            onClick={(e) => {
              e.stopPropagation();
              if (e.ctrlKey || e.metaKey || isCtrlDown) {
                setHoveredEdge(null);
                onCutEdge?.(edge.id);
              } else {
                onEdgeClick?.(edge);
              }
            }}
            className={`organic-chip pointer-events-auto cursor-pointer transition-all duration-200 ${
              isHovered ? '!bg-text-primary !text-white-pure !border-text-primary scale-110 !shadow-lg' : ''
            }`}
            style={{
              left: `${edge.midpoint.x}px`,
              top: `${edge.midpoint.y}px`,
              borderColor: edge.color || undefined,
            }}
          >
            {edge.label}
          </div>
        );
      })}

      {/* 4. Linkage Hover Tooltips Rendered to body via createPortal to bypass canvas CSS transform coordinates */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Linkage Hover Explanation */}
          {activeHoveredEdge && !isCtrlDown && (activeHoveredEdge.description || activeHoveredEdge.mathematics) && (
            <div
              className="fixed z-50 pointer-events-none bg-white border border-[#C5C2BC] rounded-xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] max-w-[340px] text-xs font-sans transition-opacity duration-150 animate-in fade-in select-none"
              style={{
                backgroundColor: '#FFFFFF',
                left: `${Math.min(Math.max(mousePos.x + 14, 16), window.innerWidth - 360)}px`,
                top: `${Math.min(Math.max(mousePos.y + 14, 16), window.innerHeight - 180)}px`,
              }}
            >
              {activeHoveredEdge.label && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-grey-soft text-text-secondary border border-grey-medium">
                    {activeHoveredEdge.label}
                  </span>
                </div>
              )}

              {activeHoveredEdge.description && (
                <p className="text-[12px] text-[#1E1B18] font-medium leading-[1.55] m-0">
                  {activeHoveredEdge.description}
                </p>
              )}

              {activeHoveredEdge.mathematics && (
                <div className="bg-white-warm border border-grey-medium rounded-lg p-2 text-center mt-2 shadow-xs overflow-x-auto">
                  <MathFormula math={activeHoveredEdge.mathematics} inline />
                </div>
              )}
            </div>
          )}

          {/* Scissors Cut Tooltip */}
          {activeHoveredEdge && isCtrlDown && (
            <div
              className="fixed z-50 pointer-events-none bg-red-600 text-white font-mono text-[10.5px] font-semibold px-2.5 py-1 rounded-full shadow-[0_4px_16px_rgba(239,68,68,0.4)] flex items-center gap-1.5 animate-in fade-in select-none"
              style={{
                left: `${mousePos.x + 14}px`,
                top: `${mousePos.y - 14}px`,
              }}
            >
              <span>✂️</span>
              <span>Click to cut linkage</span>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  );
};
